import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as https from 'https';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { PrismaService } from '@prisma/prisma.service';
import { AddressType } from '@prisma/client';
import { CheckAddressDto } from './dto/check-address.dto';
import { v4 } from 'uuid';

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const parser = new xml2js.Parser({ explicitArray: false });

@Injectable()
export class GradService implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

  private session: string;

  async onModuleInit() {
    await this.generateSession();
    setInterval(
      async () => {
        await this.generateSession();
      },
      19 * 60 * 1000,
    ); // обновляем сессию раз в 19 минут. лучше обновлять если makeRequest отдает sessionExpired, но это доработать можно и потом
  }

  async generateSession() {
    const requestedSession = await this.makeRequest(
      'auth',
      {
        username: process.env.GRAD_USERNAME,
        userpswd: process.env.GRAD_PASSWORD,
      },
      true,
    );
    this.session = requestedSession.session;

    return this.session;
  }

  async getCity() {
    const requestedCity = await this.makeRequest('lists/towns', {});

    return requestedCity.list.item;
  }

  async getStreets() {
    const requestedCity = await this.makeRequest('lists/streets', {
      town_id: process.env.GRAD_TOWN_ID,
    });

    return requestedCity.list.item.map(({ $, ...street }) => street);
  }

  async getBuildings(streetId) {
    const requestedBuildings = await this.makeRequest('lists/buildings', {
      town_id: process.env.GRAD_TOWN_ID,
      street_id: streetId,
    });
    if (Number(requestedBuildings.list.$.items) === 1) {
      const { $, ...building } = requestedBuildings.list.item;
      return [building];
    }

    return requestedBuildings.list.item.map(({ $, ...buildings }) => buildings);
  }

  async getApartments(buildingId) {
    const requestedApartments = await this.makeRequest('lists/appartments', {
      town_id: process.env.GRAD_TOWN_ID,
      building_id: buildingId,
    });

    if (Number(requestedApartments.list.$.items) === 1) {
      const { $, ...apartment } = requestedApartments.list.item;
      return [apartment];
    }

    return requestedApartments.list.item.map(({ $, ...apartment }) => apartment);
  }

  async sendMeterIndications(accountId, metersList: string[], chargesList: string[]) {
    const requestedIndications = await this.makeRequest('register/payments', {
      town_id: process.env.GRAD_TOWN_ID,
      trx_id: v4(),
      terminal_id: process.env.GRAD_TERMINAL_ID,
      account_id: accountId,
      meters_list: metersList.join(';'),
      charges_list: chargesList.join(';'),
    });

    return requestedIndications;
  }

  async sendConfirmedPayment(accountId, amount: string | number, trx_id: string, metersList: string[]) {
    const requestedPayment = await this.makeRequest('register/payments', {
      town_id: process.env.GRAD_TOWN_ID,
      trx_id: trx_id,
      terminal_id: process.env.GRAD_TERMINAL_ID,
      amount: amount,
      account_id: accountId,
      meters_list: metersList.join(';'),
      datetime: Math.floor(Date.now() / 1000),
    });
    console.log(requestedPayment);
    return requestedPayment;
  }

  async getAbonentServices(accountId) {
    const requestedServices = await this.makeRequest('lists/services', {
      town_id: process.env.GRAD_TOWN_ID,
      account_id: accountId,
      hide_overpay: 0,
    });
    return requestedServices.list.item.map(({ $, ...service }) => service);
  }

  async getAddressTenant(accountId) {
    const requestedTenant = await this.makeRequest('lists/services', {
      town_id: process.env.GRAD_TOWN_ID,
      account_id: accountId,
    });
    return { address: requestedTenant.address, tenant: requestedTenant.tenant, account: requestedTenant.account };
  }

  // мне кажется функцию можно сделать лучше
  async checkAddressExists(address: CheckAddressDto) {
    const street = await this.prismaService.externalStreetMap.findUnique({ where: { name: address.street.toUpperCase() } });
    if (!street) {
      throw new BadRequestException(`Не смогли найти улицу`);
    }

    const buildings = await this.getBuildings(street.grad_id);
    const currentBuilding = await buildings.find((e) => e.name === address.house);
    if (!currentBuilding) {
      throw new BadRequestException(`Неверный номер дома`);
    }
    const apartments = await this.getApartments(currentBuilding.id); // 6887 case down

    // есть частные дома, у которых два аккаунта на одно здание к примеру 6887
    // аномалия неизвестна, может когда дом продают - старый акк и новый появляются
    if (!address.apartment && apartments.length > 1 && !apartments[0].name) {
      const tenantPromises = apartments.map((apartment) => this.getAddressTenant(apartment.account));
      return await Promise.all(tenantPromises);
    }
    if (!address.apartment && apartments.length > 1 && apartments[0].name) {
      throw new BadRequestException('Номер квартиры не указан');
    }

    if (address.apartment) {
      const currentAppartment = apartments.find((e) => e.name === address.apartment);
      if (!currentAppartment) {
        throw new BadRequestException(`Неверный номер квартиры`);
      }
      return [await this.getAddressTenant(currentAppartment.account)];
    }
    if (!address.apartment && apartments.length === 1) {
      return [await this.getAddressTenant(apartments[0].account)];
    }
    throw new BadRequestException('Необработанная ошибка');
  }

  // REFACTOR CONTINUE
  async getMeters(systemId) {
    const requestedMetters = await this.makeRequest('lists/meters', {
      town_id: process.env.GRAD_TOWN_ID,
      abonent_id: systemId,
    });

    const configuratedData = {
      items: requestedMetters.meters.$.items,
      meters: [],
    };

    if (configuratedData.items > 1) {
      for (let i = 0; configuratedData.items > i; i++) {
        configuratedData.meters.push(requestedMetters.meters.meter[i]);
      }
      configuratedData.meters = configuratedData.meters.map((meter) => meter['$']);

      return configuratedData.meters;
    }
    if (configuratedData.items === '1') {
      configuratedData.meters.push(requestedMetters.meters.meter.$);
      return configuratedData.meters;
    }

    return configuratedData.meters;
  }

  //     "message": "Ошибка со стороны GRAD: Session expired", если эта ошибка то просто повторно вызываем генсессию
  private async makeRequest(endpoint, additionalParams = {}, withoutSession: boolean = false) {
    const xmlData = await instance.get(`${process.env.GRAD_API_LINK}/${endpoint}/`, {
      params: withoutSession
        ? { ...additionalParams }
        : {
            ...additionalParams,
            session: this.session,
          },
    });
    const data = await parser.parseStringPromise(xmlData.data);
    if (!Number(data.response.result.code)) {
      throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
    }
    return data.response.result;
  }
}

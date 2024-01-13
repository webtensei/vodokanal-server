import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as https from 'https';
import axios from 'axios';
import * as xml2js from 'xml2js';

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const parser = new xml2js.Parser({ explicitArray: false });

@Injectable()
export class GradService implements OnModuleInit {
  private session: string;

  async onModuleInit() {
    await this.generateSession();
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

  // getStreets - получить список всех улиц в городе, с которым работаем
  async getStreets() {
    const requestedCity = await this.makeRequest('lists/streets', {
      town_id: process.env.GRAD_TOWN_ID,
    });

    return requestedCity.list.item.map(({ $, ...street }) => street);
  }

  // getHouse - получить список всех домов на конкретной улице
  async getBuildings(streetId) {
    const requestedBuildings = await this.makeRequest('lists/buildings', {
      town_id: process.env.GRAD_TOWN_ID,
      street_id: streetId,
    });

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

  async getAbonentServices(accountId) {
    const requestedServices = await this.makeRequest('lists/services', {
      town_id: process.env.GRAD_TOWN_ID,
      account_id: accountId,
    });
    return requestedServices.list.item.map(({ $, ...service }) => service);
  }

  async getAddressTenant(accountId) {
    const requestedTenant = await this.makeRequest('lists/services', {
      town_id: process.env.GRAD_TOWN_ID,
      account_id: accountId,
    });
    return requestedTenant.tenant;
  }

  // refactor CONTINUE HERE
  // async checkAddressValid(session, fullAddress) {
  //   const buildings = await this.getBuildings(session, fullAddress.fullStreet.id);
  //   const currentBuilding = await buildings.find((e) => e.name === fullAddress.house);
  //   if (!currentBuilding) {
  //     throw new BadRequestException(`Неверный номер дома`);
  //   }
  //   const appartments = await this.getAppartments(session, currentBuilding.id);
  //   if (fullAddress.appartment) {
  //     const currentAppartment = appartments.find((e) => e.name === fullAddress.appartment);
  //     if (!currentAppartment) {
  //       throw new BadRequestException(`Неверный номер квартиры`);
  //     }
  //     return { id: currentAppartment.id, account: currentAppartment.account };
  //   } else {
  //     return { id: appartments.id, account: appartments.account };
  //   }
  // }

  // REFACTOR CONTINUE
  async getMetters(session, gradId) {
    const xmlData = await instance.post(
      process.env.GRAD_API_LINK + `/lists/meters/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}&abonent_id=${gradId.id}`,
    );
    const mettersInfo = await parser.parseStringPromise(xmlData.data).then((data) => {
      if (data.response.result.code === '0') {
        return data.response.result.desc;
      }

      const configuratedData = {
        items: data.response.result.meters.$.items,
        meters: [],
      };

      if (configuratedData.items > 1) {
        for (let i = 0; configuratedData.items > i; i++) {
          configuratedData.meters.push(data.response.result.meters.meter[i]);
        }
        configuratedData.meters = configuratedData.meters.map((meter) => meter['$']);

        return configuratedData;
      }
      if (configuratedData.items === '1') {
        configuratedData.meters.push(data.response.result.meters.meter.$);
        return configuratedData;
      }
    });
    return mettersInfo;
  }

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

import { BadRequestException, Injectable } from '@nestjs/common';
import * as https from 'https';
import axios from 'axios';
import * as xml2js from 'xml2js'; // Import xml2js as a module

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const parser = new xml2js.Parser({ explicitArray: false });

@Injectable()
export class GradService {
  async generateSession() {
    try {
      const xmlData = await instance.post(
        `https://test.prog-matik.ru/auth/?username=${process.env.GRAD_USERNAME}&userpswd=${process.env.GRAD_PASSWORD}`,
      );

      const data = await parser.parseStringPromise(xmlData.data);

      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }

      return data.response.result.session;
    } catch (error) {
      throw new BadRequestException(`Ошибка при обработке данных от GRAD: ${error.message}`);
    }
  }

  async getCity(session) {
    const xmlData = await instance.post(`https://test.prog-matik.ru/lists/towns/?session=${session}`);
    return await parser.parseStringPromise(xmlData.data).then((data) => {
      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }
      return data.response.result.list.item;
    });
  }

  // getStreets - получить список всех улиц в городе, с которым работаем
  async getStreets(session) {
    const xmlData = await instance.post(`https://test.prog-matik.ru//lists/streets/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}`);
    return await parser.parseStringPromise(xmlData.data).then((data) => {
      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }
      return data.response.result.list.item;
    });
  }

  // getHouse - получить список всех домов на конкретной улице
  async getBuildings(session, street) {
    const xmlData = await instance.post(
      `https://test.prog-matik.ru//lists/buildings/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}&street_id=${street}`,
    );
    return await parser.parseStringPromise(xmlData.data).then((data) => {
      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }
      return data.response.result.list.item;
    });
  }

  async getAppartments(session, buildingId) {
    const xmlData = await instance.post(
      `https://test.prog-matik.ru//lists/appartments/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}&building_id=${buildingId}`,
    );
    return await parser.parseStringPromise(xmlData.data).then((data) => {
      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }
      return data.response.result.list.item;
    });
  }

  async getAbonentServices(session, abonentId) {
    const xmlData = await instance.post(
      `https://test.prog-matik.ru//lists/services/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}&account_id=${abonentId}`,
    );
    return await parser.parseStringPromise(xmlData.data).then((data) => {
      if (!Number(data.response.result.code)) {
        throw new BadRequestException(`Ошибка со стороны GRAD: ${data.response.result.desc}`);
      }
      return data.response.result;
    });
  }

  // refactor
  async checkAddressValid(session, fullAddress) {
    const buildings = await this.getBuildings(session, fullAddress.fullStreet.id);
    const currentBuilding = await buildings.find((e) => e.name === fullAddress.house);
    if (!currentBuilding) {
      throw new BadRequestException(`Неверный номер дома`);
    }
    const appartments = await this.getAppartments(session, currentBuilding.id);
    if (fullAddress.appartment) {
      const currentAppartment = appartments.find((e) => e.name === fullAddress.appartment);
      if (!currentAppartment) {
        throw new BadRequestException(`Неверный номер квартиры`);
      }
      return { id: currentAppartment.id, account: currentAppartment.account };
    } else {
      return { id: appartments.id, account: appartments.account };
    }
  }

  // REFACTOR CONTINUE
  async getMetters(session, gradId) {
    const xmlData = await instance.post(
      `https://test.prog-matik.ru//lists/meters/?session=${session}&town_id=${process.env.GRAD_TOWN_ID}&abonent_id=${gradId.id}`,
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
}

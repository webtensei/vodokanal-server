import { createParamDecorator, ExecutionContext } from '@nestjs/common';

function convertIpv6ToIpv4(ipAddress: string): string {
  const ipv4Regex = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/;
  const match = ipAddress.match(ipv4Regex);

  if (match && match[1]) {
    return match[1]; // Возвращаем только часть IPv4
  }

  return ipAddress; // Возвращаем исходный IP-адрес, если преобразование не требуется
}

export const IpDoor = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const forwardedFor = request.headers['x-forwarded-for'];

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Если заголовок x-forwarded-for отсутствует, возвращаем IP-адрес из объекта запроса
  // Обрати внимание, что request.ip может вернуть '::ffff:127.0.0.1' в некоторых случаях
  // Это IPv6-адрес, представленный в виде IPv4-адреса. Можно преобразовать его, это мы и делаем функцией convertIpv6ToIpv4.
  return convertIpv6ToIpv4(request.ip);
});

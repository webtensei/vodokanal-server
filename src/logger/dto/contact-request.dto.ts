export class ContactRequestDto {
  name: string;
  email: string;
  theme: 'offer' | 'problem';
  message: string;
}

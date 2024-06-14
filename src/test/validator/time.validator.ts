import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsTimeString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTimeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          return typeof value === 'string' && timeRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Time ($value) is not in the format HH:MM';
        },
      },
    });
  };
}

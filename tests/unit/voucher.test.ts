import { faker } from '@faker-js/faker';
import { Prisma, Voucher } from '@prisma/client';

import voucherService from '../../src/services/voucherService';
import voucherRepository from '../../src/repositories/voucherRepository';

describe('Test voucher creation', () => {

  it('should call for the repository to create a voucher.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const discount = 20;
    jest.spyOn(voucherRepository, 'getVoucherByCode').mockReturnValueOnce(null);
    jest.spyOn(voucherRepository, 'createVoucher').mockReturnValue(null);

    // act
    await voucherService.createVoucher(code, discount);

    // assert
    expect(voucherRepository.createVoucher).toBeCalled();
  });

  it('should throw when the code already exist in database.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const discount = 20;
    jest.spyOn(voucherRepository, 'getVoucherByCode')
      .mockReturnValueOnce({} as Prisma.Prisma__VoucherClient<Voucher>);

    // act, assert
    await expect(voucherService.createVoucher(code, discount)).rejects.toBeTruthy();
  });

});

describe('Test voucher use', () => {

  it('should not discount if the voucher was used.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const amount = 200;
    jest.spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce({ id: 1, used: true, code, discount: 20 } as Voucher);

    // act
    const { applied } = await voucherService.applyVoucher(code, amount);

    // assert
    expect(applied).toBe(false);
  });

  it('should not discount if the amount is below 100.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const amount = 99;
    jest.spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce({} as Voucher);

    // act
    const { applied } = await voucherService.applyVoucher(code, amount);

    // assert
    expect(applied).toBe(false);
  });

  it('should discount if the amount is over 100 and return the final value.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const discount = 20;
    const amount = 200;
    const id = 1;
    const used = false;
    const expectedFinalAmount = amount * (100 - discount) / 100;
    jest.spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce({ id, discount, code, used } as Voucher);
    jest.spyOn(voucherRepository, 'useVoucher').mockImplementation((): any => { });

    // act
    const { applied, finalAmount } = await voucherService.applyVoucher(code, amount);

    // assert
    expect(applied).toBe(true);
    expect(finalAmount).toBe(expectedFinalAmount);
  });

  it('should throw when the code doesn\'t exist in database.', async () => {
    // arrange
    const CODE_SIZE = 10;
    const code = faker.random.alphaNumeric(CODE_SIZE);
    const amount = 200;
    jest.spyOn(voucherRepository, 'getVoucherByCode').mockReturnValueOnce(null);

    // act, assert
    await expect(voucherService.applyVoucher(code, amount)).rejects.toBeTruthy();
  });

});

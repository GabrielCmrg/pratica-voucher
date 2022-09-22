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

});

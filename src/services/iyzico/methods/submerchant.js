import iyzipay from "../connection/iyzipay";

export const createSubMerchant = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.subMerchant.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

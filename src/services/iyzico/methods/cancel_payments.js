import iyzipay from "../connection/iyzipay";

export const cancelPayment = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.cancel.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

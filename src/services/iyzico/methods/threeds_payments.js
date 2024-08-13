import iyzipay from "../connection/iyzipay";
//3d secure ile ödeme oluşturma methodu
export const initializePayments = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.threedsInitialize.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
//ikinci adım yani ödemeyi tamamlama methodu
export const completePayment = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.threedsPayment.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

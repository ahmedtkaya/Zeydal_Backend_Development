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

export const getSubMerchant = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.subMerchant.retrieve(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const updatePrivateSubMerchant = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.subMerchant.update(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const updateLimitedOrJointSubMerchant = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.subMerchant.update(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

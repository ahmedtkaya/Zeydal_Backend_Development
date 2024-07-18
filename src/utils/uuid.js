import { v4 as uuidv4 } from "uuid";
//burada modellerdeki uuid verisini dolduracak id üretilir(iyzipay için gerekli)
const id = () => uuidv4();

export default id;

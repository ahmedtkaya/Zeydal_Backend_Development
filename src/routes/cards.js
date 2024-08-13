import ApiError from "../errors/ApiError";
import * as Cards from "../services/iyzico/methods/cards";
import Users from "../db/users";
import id from "../utils/uuid";
import Session from "../middlewares/Session";

//varolan kullanıcıya kart ekleme methodu (yeni kart ekliyor o yüzden var olan db verisinin içerisine yeni satır ile cardUserKey eklendi)
export default (router) => {
  //session koyma sebebi kullanıcı login olduğu zaman bu sayfaya erişeceği için
  router.post("/cards", Session, async (req, res) => {
    const { card } = req.body;
    let result = await Cards.createUserCard({
      locale: req.user.locale,
      conversationId: id(),
      email: req.user.email,
      externalId: id(),
      ...(req.user?.cardUserKey && {
        cardUserKey: req.user.cardUserKey,
      }),
      card: card,
    });
    if (!req.user.cardUserKey) {
      if (result?.status === "success" && result?.cardUserKey) {
        const user = await Users.findOne({
          _id: req.user?._id,
        });
        user.cardUserKey = result?.cardUserKey;
        await user.save();
      }
    }
    res.json(result);
  });

  //kullanıcıya ait olan kartları okuma
  router.get("/cards", Session, async (req, res) => {
    if (!req.user?.cardUserKey) {
      throw new ApiError("User has no credit card", 403, "userHasNoCard");
    }
    let cards = await Cards.getUserCards({
      locale: req.user.locale,
      conversationId: id(),
      cardUserKey: req.user?.cardUserKey,
    });
    res.status(200).json(cards);
  });

  //kullanıcıya tanımlı olan kartı silmek
  router.delete("/cards/delete-by-token", Session, async (req, res) => {
    const { cardToken } = req.body;
    if (!cardToken) {
      throw new ApiError("Card token is required", 400, "cardTokenRequired");
    }
    let deleteResult = await Cards.deleteUserCard({
      locale: req.user.locale,
      conversationId: id(),
      cardUserKey: req.user?.cardUserKey,
      cardToken: cardToken,
    });
    res.status(200).json(deleteResult);
  });

  //kart silme index
  router.delete(
    "/cards/:cardIndex/delete-by-index",
    Session,
    async (req, res) => {
      if (!req.params?.cardIndex) {
        throw new ApiError("Card Index is required", 400, "cardIndexRequired");
      }
      let cards = await Cards.getUserCards({
        locale: req.user.locale,
        conversationId: id(),
        cardUserKey: req.user?.cardUserKey,
      });
      const index = parseInt(req.params?.cardIndex); //urldeki cardIndex kısmındaki sayıyı int olarak alır(defaultu string normalde)
      if (index >= cards?.cardDetails.length) {
        throw new ApiError("Card Does not exists", 400, "cardIndexInvalid");
      }
      const { cardToken } = cards?.cardDetails[index];
      let deleteResult = await Cards.deleteUserCard({
        locale: req.user.locale,
        conversationId: id(),
        cardUserKey: req.user?.cardUserKey,
        cardToken: cardToken,
      });

      res.json(deleteResult);
    }
  );
};

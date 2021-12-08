const Combo = require("../models/Combo");
const asyncWrapper = require('../middlewares/async');

exports.singleCombo = asyncWrapper( async (req, res = response ) => {
  let { title } = req.query;
  if (title) {
    title = title.replace('+',' ')
  }
  const combo = await Combo.findOne({title: title}).populate(
    "products",
    "name"
  );
  if (!combo) {
    return res.status(404).json({
      ok: false,
      msg: "No combo found with that title",
    });
  }
  res.json({
    ok: true,
    combo
  })
})

exports.getCombos = async (req, res = response) => {
  const combos = await Combo.find({ availability: true })

  if (combos.length < 1) {
    return res.status(404).json({
      ok: false,
      msg: "Any available combos found",
    });
  }
  res.json({
    ok: true,
    combos,
  });
};

exports.setCombos = (req, res = response, next) => {
  const {title, price, products } = req.body;

  if (!title || !price || !products) {
    return res.status(400).json({
      ok: false,
      msg: "No data send it to the server",
    });
  }
  Combo.create({
    title: title,
    products: products.split(','),
    price: price,
    image: "no image yet",
  })
    .then((result) => {
        req.result = result;

        next()
    })
    .catch((err) => {
      console.log(err);
      next(err)
    });
};

exports.removeCombo = (req, res = response) => {
  const comboId = req.params.id;
  Combo.deleteOne({ _id: comboId })
    .then((result) => {
      return res.json({
        ok: true,
        msg: `Combo ${comboId} removed`,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        ok: false,
        msg: "Error removing combo",
      });
    });
};

const express = require('express')
const conversionRatios = require('../data/conversionRatios')

const router = express.Router()
function convertTemperature(value, from, to) {
  if (from === to) return value;

  const conversions = {
    celsius: {
      fahrenheit: (v) => v * 9 / 5 + 32,
      kelvin: (v) => v + 273.15,
    },
    fahrenheit: {
      celsius: (v) => (v - 32) * 5 / 9,
      kelvin: (v) => (v - 32) * 5 / 9 + 273.15,
    },
    kelvin: {
      celsius: (v) => v - 273.15,
      fahrenheit: (v) => (v - 273.15) * 9 / 5 + 32,
    }
  };

  const convertFn = conversions[from]?.[to];
  return convertFn ? convertFn(value) : null;
}
/**
 * @swagger
 * /convert:
 *   get:
 *     summary: Convert a value from one unit to another based on type
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of conversion (e.g., length, weight, temperature, bundle)
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: number
 *         description: The numeric value to convert
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: The original unit (e.g., meter, celsius)
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: The unit to convert to (e.g., kilometer, fahrenheit)
 *     responses:
 *       200:
 *         description: Successful conversion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 *                 unit:
 *                   type: string
 *       400:
 *         description: Missing or invalid query parameters
 */
router.get('/convert', (req, res) => {
  const { type, value, from, to } = req.query;

  if (!type || !value || !from || !to) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const numericValue = parseFloat(value);
  const ratios = conversionRatios[type];

  if (!ratios) {
    return res.status(400).json({ error: `Unsupported conversion type: ${type}` });
  }

  if (type === 'temperature') {
    const converted = convertTemperature(numericValue, from, to);
    if (converted === null) {
      return res.status(400).json({ error: 'Unsupported temperature conversion' });
    }
    return res.json({ result: converted, unit: to });
  }

  const fromRatio = ratios[from];
  const toRatio = ratios[to];

  if (fromRatio == null || toRatio == null) {
    return res.status(400).json({ error: 'Invalid unit(s)' });
  }

  const result = (numericValue / fromRatio) * toRatio;
  res.json({ result, unit: to });
});

module.exports = router
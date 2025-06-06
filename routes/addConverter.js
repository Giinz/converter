const express = require("express");
const conversionRatios = require("../data/conversionRatios");

const router = express.Router();

/**
 * @swagger
 * /add-custom-unit:
 *   post:
 *     summary: Add custom conversion units
 *     description: Add one or more custom unit conversions (e.g., pack to bottle, box to item).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - type
 *                 - from
 *                 - to
 *                 - ratio
 *               properties:
 *                 type:
 *                   type: string
 *                   example: bundle
 *                   description: Category/type of the unit (e.g., weight, length, custom, bundle)
 *                 from:
 *                   type: string
 *                   example: pack
 *                   description: Unit to convert from
 *                 to:
 *                   type: string
 *                   example: bottle
 *                   description: Unit to convert to
 *                 ratio:
 *                   type: number
 *                   example: 12
 *                   description: Conversion ratio (e.g., 1 pack = 12 bottles)
 *     responses:
 *       200:
 *         description: Custom units added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Custom units added successfully
 *       400:
 *         description: Validation error or bad input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       from:
 *                         type: string
 *                       to:
 *                         type: string
 *                       error:
 *                         type: string
 */

router.post('/add-custom-unit', (req, res) => {
  const customUnits = req.body;

  if (!Array.isArray(customUnits) || customUnits.length === 0) {
    return res.status(400).json({ error: 'Request body must be a non-empty array' });
  }

  const errors = [];

  customUnits.forEach(({ type, from, to, ratio }) => {
    if (!type || !from || !to || typeof ratio !== 'number') {
      errors.push({ from, to, error: 'Missing or invalid fields' });
      return;
    }

    const reservedTypes = ["length", "weight", "temperature"];
    if (reservedTypes.includes(type) ) {
      errors.push({ from, to, error: `Cannot override system type: ${type}` });
      return;
    }

    if (!conversionRatios[type]) {
      conversionRatios[type] = {};
    }
    const typeMap = conversionRatios[type];

    const fromExists = typeMap.hasOwnProperty(from);
    const toExists = typeMap.hasOwnProperty(to);
    let baseUnit = null;
    let baseRatio = Infinity;
  
    for (const [unit, value] of Object.entries(typeMap)) {
      if (value < baseRatio) {
        baseRatio = value;
        baseUnit = unit;
      }
    }
  
    if (fromExists && toExists) {
      typeMap[to] = typeMap[from] * ratio;
    } else if (fromExists) {
      typeMap[to] = typeMap[from] * ratio;
    } else if (toExists) {
      typeMap[from] = typeMap[to] / ratio;
    } else if (baseUnit) {
      typeMap[from] = baseRatio * ratio;
      typeMap[to] = baseRatio;
    } else {
      typeMap[from] = 1;
      typeMap[to] = ratio;
    }
    const entries = Object.entries(typeMap);
    const minEntry = entries.reduce((min, [unit, val]) => val < min[1] ? [unit, val] : min, entries[0]);
  
    const [newBaseUnit, newBaseValue] = minEntry;
  
    if (newBaseValue < 1) {
      const factor = 1 / newBaseValue;
      Object.keys(typeMap).forEach(key => {
        typeMap[key] *= factor;
      });
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Some entries were invalid', details: errors });
  }

  return res.json({ message: 'Custom units added successfully' });
});


module.exports = router;

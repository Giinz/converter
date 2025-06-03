const express = require("express");
const conversionRatios = require("../data/conversionRatios");
const typeList = Object.keys(conversionRatios)
const router = express.Router();
/**
 * @swagger
 * /list-converters:
 *   get:
 *     summary: Get all conversion types and their unit ratios
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: The type of conversion (e.g., length, weight, temperature, bundle)
 *     responses:
 *       200:
 *         description: List of all unit converters and their ratios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 */
router.get("/list-converters", (req, res) => {
    const { type } = req.query;
  
    const formatted = (list) =>
      Object.entries(list).map(([type, units]) => ({
        type,
        units: Object.entries(units).map(([unit, ratio]) => ({
          unit,
          ratio,
        })),
      }));
  
    if (!type) {
      return res.json(formatted(conversionRatios));
    }
  
    if (!conversionRatios[type]) {
      return res.status(400).json({ error: `No converter found for type '${type}'` });
    }
  
    return res.json(formatted({ [type]: conversionRatios[type] }));
  });
  

module.exports = router;

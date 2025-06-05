const express = require('express');
const conversionRatios = require('../data/conversionRatios');
const router = express.Router();

/**
 * @swagger
 * /delete-converter:
 *   delete:
 *     summary: Delete a specific converter unit from a type
 *     description: Removes a single unit (e.g., "mile") from a converter type (e.g., "length").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - unit
 *             properties:
 *               type:
 *                 type: string
 *                 example: length
 *                 description: The category/type to delete from
 *               unit:
 *                 type: string
 *                 example: mile
 *                 description: The unit to delete
 *     responses:
 *       200:
 *         description: Converter unit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Converter unit deleted successfully
 *       400:
 *         description: Type or unit not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Type or unit not found
 */

router.delete('/delete-converter', (req, res) => {
  const { type, unit } = req.body;
  const reservedTypes = ["length", "weight", "temperature"];
  if( reservedTypes.includes(type))    return res.status(400).json({ error: `Cannot override system type: ${type}` });
  if (
    !type || !unit ||
    !conversionRatios[type] ||
    !conversionRatios[type][unit]
  ) {
    return res.status(400).json({ error: 'Type or unit not found' });
  }

  delete conversionRatios[type][unit];

  return res.status(200).json({ message: 'Converter unit deleted successfully' });
});

module.exports = router;

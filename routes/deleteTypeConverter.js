const express = require('express')
const conversionRatios = require('../data/conversionRatios')
const router = express.Router();

/**
 * @swagger
 * /delete-converter-type:
 *   delete:
 *     summary: Delete an entire converter type
 *     description: Deletes a converter category/type (e.g., "length", "weight") from the conversionRatios object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 example: length
 *                 description: The converter type/category to delete
 *     responses:
 *       200:
 *         description: Converter type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delete converter type successfully
 *       400:
 *         description: Converter type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: There is no type of converter match
 */

router.delete('/delete-converter-type',(req,res)=>{
    const {type} = req.body
    const reservedTypes = ["length", "weight", "temperature"];
    if( reservedTypes.includes(reservedTypes))    return res.status(400).json({ error: `Cannot override system type: ${type}` });
    if (conversionRatios[type]) {
        delete conversionRatios[type];
        return res.status(200).json({message:'Delete converter type successfully'})
      }
    return res.status(400).json({ error: 'There is no type of converter match' });
})
module.exports = router
require('dotenv').config();
const express = require('express');
const app = express();
const getConverter = require('./routes/converter')
const addConverterRoutes = require('./routes/addConverter')
const getListConvert = require('./routes/getListConvertType')
const deleteConverterType = require('./routes/deleteTypeConverter')
const deleteSingleConverter = require('./routes/deleteConverter')
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Express API for JSONPlaceholder',
      version: '1.0.0',
    },
  };
  
  const options = {
    swaggerDefinition,
    apis: ['./routes/*'],
  };
  
  const swaggerSpec = swaggerJSDoc(options);

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(getListConvert)
app.use(getConverter)
app.use(addConverterRoutes)
app.use(deleteConverterType)
app.use(deleteSingleConverter)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Unit Converter API is running on http://localhost:${PORT}`);
});

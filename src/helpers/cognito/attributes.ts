import attributes from "../../../data/cognito-attributes.json";

export function validator(schema: { [name: string]: any }): {
  [name: string]: any;
} {
  for (const attribute of attributes) {
    if (attribute.Required) schema.required.push(attribute.Name);

    schema.properties[attribute.Name] = {
      type: attribute.AttributeDataType.toLowerCase(),
    };
    if (attribute.StringAttributeConstraints?.MaxLength) {
      schema.properties[attribute.Name].maxLength =
        attribute.StringAttributeConstraints.MaxLength;
    }
    if (attribute.StringAttributeConstraints?.MinLength) {
      schema.properties[attribute.Name].minLength =
        attribute.StringAttributeConstraints.MinLength;
    }
    if (attribute.NumberAttributeConstraints?.MaxValue) {
      schema.properties[attribute.Name].maximum =
        attribute.NumberAttributeConstraints.MaxValue;
    }
    if (attribute.NumberAttributeConstraints?.MinValue) {
      schema.properties[attribute.Name].minimum =
        attribute.NumberAttributeConstraints.MinValue;
    }
  }

  return schema;
}

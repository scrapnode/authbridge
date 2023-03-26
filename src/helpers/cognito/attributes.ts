import attributes from "../../../data/cognito-attributes.json";

export function validator(obj: { [name: string]: any }): {
  [name: string]: any;
} {
  for (const attribute of attributes) {
    if (attribute.Required) obj.required.push(attribute.Name);

    obj.properties[attribute.Name] = {
      type: attribute.AttributeDataType.toLowerCase(),
    };
    if (attribute.StringAttributeConstraints?.MaxLength) {
      obj.properties[attribute.Name].maxLength =
        attribute.StringAttributeConstraints.MaxLength;
    }
    if (attribute.StringAttributeConstraints?.MinLength) {
      obj.properties[attribute.Name].minLength =
        attribute.StringAttributeConstraints.MinLength;
    }
    if (attribute.NumberAttributeConstraints?.MaxValue) {
      obj.properties[attribute.Name].maximum =
        attribute.NumberAttributeConstraints.MaxValue;
    }
    if (attribute.NumberAttributeConstraints?.MinValue) {
      obj.properties[attribute.Name].minimum =
        attribute.NumberAttributeConstraints.MinValue;
    }
  }

  return obj;
}

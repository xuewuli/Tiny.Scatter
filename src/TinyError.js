export default class TinyError {
  constructor(_type, _message, _code = 402) {
    this.type = _type;
    this.message = _message;
    this.code = _code;
    this.isError = true;
  }

  static signatureError(_type, _message) {
    return new TinyError(_type, _message, 402);
  }
}

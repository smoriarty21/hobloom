function Asset(data) {
    this.id = data.id;
    this.type = data.type;
    this.pin = data.pin;
    this.name = data.name;
}

Asset.prototype.getId = function () {
    return this.id;
};

Asset.prototype.setId = function (id) {
    this.id = id;
};

Asset.prototype.getType = function () {
    return this.type;
};

Asset.prototype.setType = function (type) {
    this.type = type;
};

Asset.prototype.getPin = function () {
    return this.pin;
};

Asset.prototype.setPin = function (pin) {
    this.pin = pin;
};
Asset.prototype.getName = function () {
    return this.name;
};

Asset.prototype.setName = function (name) {
    this.pin = name;
};


module.exports = Asset;
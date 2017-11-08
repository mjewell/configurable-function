export function setPrototypeOf(subClass, superClass) {
  Object.hasOwnProperty('setPrototypeOf')
    ? Object['setPrototypeOf'](subClass, superClass)
    : (subClass.__proto__ = superClass);
}

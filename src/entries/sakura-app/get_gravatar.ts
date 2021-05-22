import MD5 from 'md5'
/**
 * Gravatar
 * from a6cd66c 11.third-part-functions.js
 */
const get_gravatar = (email: string, size: string | number = 80) =>'https://' + Poi.gravatar_url + '/' + MD5(email) + '.jpg?s=' + size + '&d=mm';
export default get_gravatar
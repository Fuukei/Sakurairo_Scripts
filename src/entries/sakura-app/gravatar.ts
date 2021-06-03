import MD5 from 'md5'
/**
 * Gravatar
 * from a6cd66c 11.third-part-functions.js
 */
export const get_gravatar = (email:string, size= 80) =>'https://' + Poi.gravatar_url + '/' + MD5(email) + '.jpg?s=' + size + '&d=mm';
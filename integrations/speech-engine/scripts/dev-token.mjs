// Local development only; never commit the secret or use token generation as user authentication.
import {createHmac} from 'node:crypto';
const secret=process.env.AUTH_JWT_SECRET;if(!secret||secret.length<32)throw Error('Set AUTH_JWT_SECRET (32+ characters) from your .dev.vars file');
const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const msg=b({alg:'HS256',typ:'JWT'})+'.'+b({sub:process.env.DEV_USER_ID||'local-developer',exp:Math.floor(Date.now()/1000)+3600});console.log(msg+'.'+createHmac('sha256',secret).update(msg).digest('base64url'));


var DEBUG = true;
var htmlNS = "http://www.w3.org/1999/xhtml";
var svgNS = "http://www.w3.org/2000/svg";

namespace Core
{
    export interface HashTable<T> {
        [key: string]: T;
    }

    export class Util
    {
        static clone(obj : object)
        {
            if(obj === undefined)
                return undefined;
            if(obj === null || typeof(obj) !== 'object')
                return null;
            var clone = {};
            for(var prop in obj)
                clone[prop] = obj[prop];
            return clone;
        }

        static encodeURIQuery(obj : any) : string
        {
            // encode arguments
            let args = '';

            let encodeArg = (arg: string, value: any) => {
                if((typeof(value) !== 'number') && (typeof(value) !== 'string') &&  (typeof(value) !== 'boolean') && (typeof(value) !== 'object'))
                    return;
                if (args !== '')
                    args += '&';
                args += encodeURIComponent(arg)+'=';
                if(typeof(value) === 'object')
                    args += encodeURIComponent(JSON.stringify(value));
                else
                    args += encodeURIComponent(value);
            };

            if((obj !== undefined) && (obj !== null)) {
                for(let prop in obj) {
                    let propValue = obj[prop];
                    if (propValue instanceof Array) {
                        for (let value of (propValue as Array<any>))
                            encodeArg(prop, value);
                    }
                    else
                        encodeArg(prop, propValue);
                }
            }
            return args;
        }

        static utf8Encode(value: string) : string
        {
            var res = '';
            for(var i = 0; i < value.length; i++) {
                var c = value.charCodeAt(i);
                if(c < 128)
                    res += String.fromCharCode(c);
                else if((c >= 128) && (c < 2048)) {
                    res += String.fromCharCode((c >> 6) | 192);
                    res += String.fromCharCode((c & 63) | 128);
                }
                else {
                    res += String.fromCharCode((c >> 12) | 224);
                    res += String.fromCharCode(((c >> 6) & 63) | 128);
                    res += String.fromCharCode((c & 63) | 128);
                }
            }
            return res;
        }

        static utf8Decode(value: string) : string
        {
            let res = '';
            let i = 0;
            let c;
            while(i < value.length) {
                c = value.charCodeAt(i++);
                if(c < 128)
                    res += String.fromCharCode(c);
                else if((c >= 192) && (c < 224))
                    res += String.fromCharCode(((c & 31) << 6) | (value.charCodeAt(i++) & 63));
                else
                    res += String.fromCharCode(((c & 15) << 12) | ((value.charCodeAt(i++) & 63) << 6) | (value.charCodeAt(i++) & 63));
            }
            return res;
        }

        static toBase64(stringValue: string) : string
        {
            let val1; let val2; let val3;
            let enc1; let enc2; let enc3; let enc4;
            let value = Util.utf8Encode(stringValue);
            let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let res = '';
            let i = 0;
            while (i + 2 < value.length)
            {
                val1 = value.charCodeAt(i++) & 0xff;
                val2 = value.charCodeAt(i++) & 0xff;
                val3 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
                enc3 = code.charAt(((val2 & 15) << 2) | (val3 >> 6));
                enc4 = code.charAt(val3 & 63);
                res += enc1+enc2+enc3+enc4;
            }
            // 2 bytes
            if (i + 1 < value.length)
            {
                val1 = value.charCodeAt(i++) & 0xff;
                val2 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
                enc3 = code.charAt((val2 & 15) << 2);
                res += enc1+enc2+enc3+'=';
            }
            // 1 byte
            else if (i < value.length)
            {
                val1 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt((val1 & 3) << 4);
                res += enc1+enc2+'==';
            }
            return res;
        }

        static fromBase64(value: string) : string
        {
            let char1; let char2; let char3;
            let enc1; let enc2; let enc3; let enc4;
            let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            let res = '';
            let i = 0;
            while (i < value.length)
            {
                enc1 = code.indexOf(value.charAt(i++));
                enc2 = code.indexOf(value.charAt(i++));
                enc3 = code.indexOf(value.charAt(i++));
                enc4 = code.indexOf(value.charAt(i++));

                char1 = (enc1 << 2) | (enc2 >> 4);
                char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                char3 = ((enc3 & 3) << 6) | enc4;

                res += String.fromCharCode(char1);
                if(enc3 !== 64) {
                    res += String.fromCharCode(char2);
                    if(enc4 !== 64)
                        res += String.fromCharCode(char3);
                }
            }
            return Util.utf8Decode(res);
        }

        static toNoDiacritics(value : string) : string
        {
          let defaultDiacriticsRemovalMap = [
            {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
            {'base':'AA','letters':/[\uA732]/g},
            {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
            {'base':'AO','letters':/[\uA734]/g},
            {'base':'AU','letters':/[\uA736]/g},
            {'base':'AV','letters':/[\uA738\uA73A]/g},
            {'base':'AY','letters':/[\uA73C]/g},
            {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
            {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
            {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
            {'base':'DZ','letters':/[\u01F1\u01C4]/g},
            {'base':'Dz','letters':/[\u01F2\u01C5]/g},
            {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
            {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
            {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
            {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
            {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
            {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
            {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
            {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
            {'base':'LJ','letters':/[\u01C7]/g},
            {'base':'Lj','letters':/[\u01C8]/g},
            {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
            {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
            {'base':'NJ','letters':/[\u01CA]/g},
            {'base':'Nj','letters':/[\u01CB]/g},
            {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
            {'base':'OI','letters':/[\u01A2]/g},
            {'base':'OO','letters':/[\uA74E]/g},
            {'base':'OU','letters':/[\u0222]/g},
            {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
            {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
            {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
            {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
            {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
            {'base':'TZ','letters':/[\uA728]/g},
            {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
            {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
            {'base':'VY','letters':/[\uA760]/g},
            {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
            {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
            {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
            {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
            {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
            {'base':'aa','letters':/[\uA733]/g},
            {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
            {'base':'ao','letters':/[\uA735]/g},
            {'base':'au','letters':/[\uA737]/g},
            {'base':'av','letters':/[\uA739\uA73B]/g},
            {'base':'ay','letters':/[\uA73D]/g},
            {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
            {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
            {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
            {'base':'dz','letters':/[\u01F3\u01C6]/g},
            {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
            {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
            {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
            {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
            {'base':'hv','letters':/[\u0195]/g},
            {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
            {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
            {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
            {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
            {'base':'lj','letters':/[\u01C9]/g},
            {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
            {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
            {'base':'nj','letters':/[\u01CC]/g},
            {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
            {'base':'oi','letters':/[\u01A3]/g},
            {'base':'ou','letters':/[\u0223]/g},
            {'base':'oo','letters':/[\uA74F]/g},
            {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
            {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
            {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
            {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
            {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
            {'base':'tz','letters':/[\uA729]/g},
            {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
            {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
            {'base':'vy','letters':/[\uA761]/g},
            {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
            {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
            {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
            {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
          ];
          var str = value;
          for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++)
            {
            str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
          }
          return str;
        }
    }

    export class Navigator
    {
        static isGecko: boolean = (navigator.userAgent.match(/Gecko\//i) !== null);
        static isWebkit: boolean = (navigator.userAgent.match(/WebKit\//i) !== null);

        static isIE: boolean = (navigator.userAgent.match(/MSIE/i) !== null) || (navigator.userAgent.match(/Trident/i) !== null);
        static isIE7: boolean = (navigator.userAgent.match(/MSIE 7\./i) !== null);
        static isIE8: boolean = (navigator.userAgent.match(/MSIE 8\./i) !== null);
        static isIE10: boolean = (navigator.userAgent.match(/MSIE 10\./i) !== null);
        static isIE11: boolean = Navigator.isIE && (navigator.userAgent.match(/rv:11\./i) !== null);

        static isOpera: boolean =  ((navigator.userAgent === undefined) || (navigator.userAgent.match(/Opera\//i) !== null));

        static isChrome: boolean = (navigator.userAgent.match(/ Chrome\//) !== null);

        static isSafari: boolean = (navigator.userAgent.match(/ Safari\//) !== null);

        static isFirefox: boolean = (navigator.userAgent.match(/ Firefox\//) !== null);
        static isFirefox3: boolean = (navigator.userAgent.match(/ Firefox\/3\./) !== null);
        static isFirefox3_5: boolean = (navigator.userAgent.match(/ Firefox\/3\.5\./) !== null);
        static isFirefox3_6: boolean = (navigator.userAgent.match(/ Firefox\/3\.6\./) !== null);

        static iPad: boolean = (navigator.userAgent.match(/iPad/i) !== null);
        static iPhone: boolean = (navigator.userAgent.match(/iPhone/i) !== null);
        static iOs: boolean = Navigator.iPad || Navigator.iPhone;

        static Android: boolean = (navigator.userAgent.match(/Android/i) !== null);

        static supportSVG: boolean = true;
        static supportCanvas: boolean = true;
        static supportRgba: boolean = true;
        static supportRgb: boolean = true;

        static supportOpacity: boolean = !Navigator.isIE7 && !Navigator.isIE8;

        static supportFormData: boolean = true;
        static supportFileAPI: boolean = true;
        static supportUploadDirectory: boolean = false;
    }
}

(function() {
    let test;
    Core.Navigator.supportSVG = false;
    try {
        test = document.createElementNS(svgNS, 'g');
        if('ownerSVGElement' in test)
            Core.Navigator.supportSVG = true;
    } catch(e) {}

    test = document.createElement('canvas');
    Core.Navigator.supportCanvas = 'getContext' in test;

    Core.Navigator.supportRgba = true;
    Core.Navigator.supportRgb = true;
    test = document.createElement('div');
    try {
        test.style.background = 'rgba(0, 0, 0, 0.5)';
    } catch(e) {
        Core.Navigator.supportRgba = false;
    }
    try {
        test.style.background = 'rgb(0, 0, 0)';
    } catch(e) {
        Core.Navigator.supportRgb = false;
    }

    try {
        new FormData();
    }
    catch(err) {
        Core.Navigator.supportFormData = false;
    }
    let testInput = document.createElement('input');
    Core.Navigator.supportFileAPI = 'files' in testInput;
    Core.Navigator.supportUploadDirectory = 'webkitdirectory' in testInput;
})();

// provide polyfill Object.assign if needed
if (Object.assign == undefined) {
    Object.assign = function() {
        var target = arguments[0];
        var i; var key;
        for (i = 1; i < arguments.length; i++) {
            for (key in arguments[i]) {
                target[key] = arguments[i][key];
            }
        }
        return target;
    }
}

// Polyfill for Promise
(function () { 'use strict';

var promiseFinally = function(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
};

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  this._state = 0;
  this._handled = false;
  this._value = undefined;
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  (Promise as any)._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    (Promise as any)._immediateFn(function() {
      if (!self._handled) {
        (Promise as any)._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

//
// Take a potentially misbehaving resolver function and make sure
// onFulfilled and onRejected are only called once.
//
// Makes no guarantees about asynchrony.
//
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = promiseFinally;

(Promise as any).all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      throw new TypeError('Promise.all accepts an array');
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

(Promise as any).resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

(Promise as any).reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

(Promise as any).race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
(Promise as any)._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

(Promise as any)._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

if (!(window as any).Promise)
  (window as any).Promise = Promise;
})();

/*
// Implement trim if it's not natively available
// Code from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim#Compatibility
if(!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g,'');
    };
}

// Implement bind function if not supported
if(!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        var scope = obj;
        var callback = this;
        var args;
        if(arguments.length > 1)
            args = arguments.slice(1, arguments.length-1);
        else
            args = [];
        var wrapper = function() {
            return callback.apply(scope, args.concat(arguments));
        };
        return wrapper;
    };
}

// correct IE specific bugs
if(Core.Navigator.isIE) {
    if(Core.Navigator.supportSVG) {
        SVGTextContentElement.prototype.__getStartPositionOfChar = SVGTextContentElement.prototype.getStartPositionOfChar;
        SVGTextContentElement.prototype.getStartPositionOfChar = function(charnum) {
            var point = this.__getStartPositionOfChar(charnum);
            return point.matrixTransform(this.getScreenCTM().inverse());
        };
        SVGTextContentElement.prototype.__getEndPositionOfChar = SVGTextContentElement.prototype.getEndPositionOfChar;
        SVGTextContentElement.prototype.getEndPositionOfChar = function(charnum) {
            var point = this.__getEndPositionOfChar(charnum);
            return point.matrixTransform(this.getScreenCTM().inverse());
        };

        SVGTextContentElement.prototype.__getCharNumAtPosition = SVGTextContentElement.prototype.getCharNumAtPosition;
        SVGTextContentElement.prototype.getCharNumAtPosition = function(point) {
            return this.getCharNumAtPositionHelper(point.x, 0, this.getNumberOfChars()-1);
        };
        SVGTextContentElement.prototype.getCharNumAtPositionHelper = function(x, start, end) {
            let startX = this.getStartPositionOfChar(start).x;
            let endX = this.getEndPositionOfChar(end).x;
            if((x < startX) || (x > endX))
                return -1;
            if(start == end)
                return start;
            var middle = Math.floor((start + end)/2);
            var res = this.getCharNumAtPositionHelper(x, start, middle);
            if(res != -1)
                return res;
            return this.getCharNumAtPositionHelper(x, middle+1, end);
        };
    }
}
*/
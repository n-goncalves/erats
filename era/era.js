var Core;
(function (Core) {
    var Object = (function () {
        function Object() {
            this.events = undefined;
        }
        Object.prototype.addEvents = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.events === undefined)
                this.events = [];
            for (var i = 0; i < args.length; i++)
                this.events[args[i]] = [];
        };
        Object.prototype.hasEvent = function (eventName) {
            return (this.events !== undefined) && (eventName in this.events);
        };
        Object.prototype.fireEvent = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var handled = false;
            var eventListeners = this.events[eventName];
            if (eventListeners !== undefined) {
                eventListeners = eventListeners.slice();
                for (var i = 0; (i < eventListeners.length) && !handled; i++) {
                    if (eventListeners[i].capture === true) {
                        handled = eventListeners[i].method.apply(eventListeners[i].scope, args);
                        if (handled === undefined)
                            handled = false;
                    }
                }
                for (var i = 0; (i < eventListeners.length) && !handled; i++) {
                    if (eventListeners[i].capture !== true) {
                        handled = eventListeners[i].method.apply(eventListeners[i].scope, args);
                        if (handled === undefined)
                            handled = false;
                    }
                }
            }
            else if (DEBUG)
                throw ('Event \'' + eventName + '\' not found on ' + this);
            return handled;
        };
        Object.prototype.connect = function (obj, eventName, method, capture) {
            if (capture === void 0) { capture = false; }
            var wrapper;
            if (capture === undefined)
                capture = false;
            if (DEBUG && (typeof (method) !== 'function'))
                throw ('Invalid method to connect on event \'' + eventName + '\'');
            if ('addEventListener' in obj) {
                wrapper = function () {
                    return wrapper.callback.apply(wrapper.scope, arguments);
                };
                wrapper.scope = this;
                wrapper.callback = method;
                wrapper.eventName = eventName;
                wrapper.capture = capture;
                obj.addEventListener(eventName, wrapper, capture);
                if (obj.events === undefined)
                    obj.events = [];
                obj.events.push(wrapper);
            }
            else {
                var signal = { scope: this, method: method, capture: capture };
                var eventListeners = obj.events[eventName];
                if (eventListeners !== undefined)
                    eventListeners.push(signal);
                else if (DEBUG)
                    throw ('Event \'' + eventName + '\' not found on ' + obj);
            }
        };
        Object.prototype.getEventHandlers = function (eventName) {
            var eventListeners = this.events[eventName];
            if (eventListeners !== undefined)
                return eventListeners.slice();
            else
                return [];
        };
        Object.prototype.disconnect = function (obj, eventName, method) {
            var wrapper;
            var signal;
            if ('removeEventListener' in obj) {
                for (var i = 0; (obj.events !== undefined) && (i < obj.events.length); i++) {
                    wrapper = obj.events[i];
                    if ((wrapper.scope === this) && (wrapper.eventName === eventName)) {
                        if ((method !== undefined) && (wrapper.callback !== method))
                            continue;
                        obj.removeEventListener(wrapper.eventName, wrapper, wrapper.capture);
                        obj.events.splice(i, 1);
                        i--;
                    }
                }
            }
            else {
                for (var i = 0; (obj.events !== undefined) && (i < obj.events[eventName].length); i++) {
                    signal = obj.events[eventName][i];
                    if (signal.scope == this) {
                        if ((method !== undefined) && (signal.method !== method))
                            continue;
                        obj.events[eventName].splice(i, 1);
                        i--;
                    }
                }
            }
        };
        Object.prototype.serialize = function () {
            return JSON.stringify(this);
        };
        Object.prototype.getClassName = function () {
            if ('name' in this.constructor)
                return this.constructor['name'];
            else
                return /function (.{1,})\(/.exec(this.constructor.toString())[0];
        };
        Object.prototype.assign = function (init) {
            if (!init)
                return;
            for (var prop in init)
                this[prop] = init[prop];
        };
        Object.prototype.toString = function () {
            return "[object " + this.getClassName() + "]";
        };
        return Object;
    }());
    Core.Object = Object;
})(Core || (Core = {}));
var DEBUG = true;
var htmlNS = "http://www.w3.org/1999/xhtml";
var svgNS = "http://www.w3.org/2000/svg";
var Core;
(function (Core) {
    var Util = (function () {
        function Util() {
        }
        Util.clone = function (obj) {
            if (obj === undefined)
                return undefined;
            if (obj === null || typeof (obj) !== 'object')
                return null;
            var clone = {};
            for (var prop in obj)
                clone[prop] = obj[prop];
            return clone;
        };
        Util.encodeURIQuery = function (obj) {
            var args = '';
            if ((obj !== undefined) && (obj !== null)) {
                for (var prop in obj) {
                    var propValue = obj[prop];
                    if ((typeof (propValue) !== 'number') && (typeof (propValue) !== 'string') && (typeof (propValue) !== 'boolean') && (typeof (propValue) !== 'object'))
                        continue;
                    if (args !== '')
                        args += '&';
                    args += encodeURIComponent(prop) + '=';
                    if (typeof (propValue) === 'object')
                        args += encodeURIComponent(JSON.stringify(propValue));
                    else
                        args += encodeURIComponent(propValue);
                }
            }
            return args;
        };
        Util.utf8Encode = function (value) {
            var res = '';
            for (var i = 0; i < value.length; i++) {
                var c = value.charCodeAt(i);
                if (c < 128)
                    res += String.fromCharCode(c);
                else if ((c >= 128) && (c < 2048)) {
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
        };
        Util.utf8Decode = function (value) {
            var res = '';
            var i = 0;
            var c;
            while (i < value.length) {
                c = value.charCodeAt(i++);
                if (c < 128)
                    res += String.fromCharCode(c);
                else if ((c >= 192) && (c < 224))
                    res += String.fromCharCode(((c & 31) << 6) | (value.charCodeAt(i++) & 63));
                else
                    res += String.fromCharCode(((c & 15) << 12) | ((value.charCodeAt(i++) & 63) << 6) | (value.charCodeAt(i++) & 63));
            }
            return res;
        };
        Util.toBase64 = function (stringValue) {
            var val1;
            var val2;
            var val3;
            var enc1;
            var enc2;
            var enc3;
            var enc4;
            var value = Util.utf8Encode(stringValue);
            var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var res = '';
            var i = 0;
            while (i + 2 < value.length) {
                val1 = value.charCodeAt(i++) & 0xff;
                val2 = value.charCodeAt(i++) & 0xff;
                val3 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
                enc3 = code.charAt(((val2 & 15) << 2) | (val3 >> 6));
                enc4 = code.charAt(val3 & 63);
                res += enc1 + enc2 + enc3 + enc4;
            }
            if (i + 1 < value.length) {
                val1 = value.charCodeAt(i++) & 0xff;
                val2 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
                enc3 = code.charAt((val2 & 15) << 2);
                res += enc1 + enc2 + enc3 + '=';
            }
            else if (i < value.length) {
                val1 = value.charCodeAt(i++) & 0xff;
                enc1 = code.charAt(val1 >> 2);
                enc2 = code.charAt((val1 & 3) << 4);
                res += enc1 + enc2 + '==';
            }
            return res;
        };
        Util.fromBase64 = function (value) {
            var char1;
            var char2;
            var char3;
            var enc1;
            var enc2;
            var enc3;
            var enc4;
            var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var res = '';
            var i = 0;
            while (i < value.length) {
                enc1 = code.indexOf(value.charAt(i++));
                enc2 = code.indexOf(value.charAt(i++));
                enc3 = code.indexOf(value.charAt(i++));
                enc4 = code.indexOf(value.charAt(i++));
                char1 = (enc1 << 2) | (enc2 >> 4);
                char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                char3 = ((enc3 & 3) << 6) | enc4;
                res += String.fromCharCode(char1);
                if (enc3 !== 64) {
                    res += String.fromCharCode(char2);
                    if (enc4 !== 64)
                        res += String.fromCharCode(char3);
                }
            }
            return Util.utf8Decode(res);
        };
        Util.toNoDiacritics = function (value) {
            var defaultDiacriticsRemovalMap = [
                { 'base': 'A', 'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
                { 'base': 'AA', 'letters': /[\uA732]/g },
                { 'base': 'AE', 'letters': /[\u00C6\u01FC\u01E2]/g },
                { 'base': 'AO', 'letters': /[\uA734]/g },
                { 'base': 'AU', 'letters': /[\uA736]/g },
                { 'base': 'AV', 'letters': /[\uA738\uA73A]/g },
                { 'base': 'AY', 'letters': /[\uA73C]/g },
                { 'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
                { 'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
                { 'base': 'D', 'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
                { 'base': 'DZ', 'letters': /[\u01F1\u01C4]/g },
                { 'base': 'Dz', 'letters': /[\u01F2\u01C5]/g },
                { 'base': 'E', 'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
                { 'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
                { 'base': 'G', 'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
                { 'base': 'H', 'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
                { 'base': 'I', 'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
                { 'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
                { 'base': 'K', 'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
                { 'base': 'L', 'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
                { 'base': 'LJ', 'letters': /[\u01C7]/g },
                { 'base': 'Lj', 'letters': /[\u01C8]/g },
                { 'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
                { 'base': 'N', 'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
                { 'base': 'NJ', 'letters': /[\u01CA]/g },
                { 'base': 'Nj', 'letters': /[\u01CB]/g },
                { 'base': 'O', 'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
                { 'base': 'OI', 'letters': /[\u01A2]/g },
                { 'base': 'OO', 'letters': /[\uA74E]/g },
                { 'base': 'OU', 'letters': /[\u0222]/g },
                { 'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
                { 'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
                { 'base': 'R', 'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
                { 'base': 'S', 'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
                { 'base': 'T', 'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
                { 'base': 'TZ', 'letters': /[\uA728]/g },
                { 'base': 'U', 'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
                { 'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
                { 'base': 'VY', 'letters': /[\uA760]/g },
                { 'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
                { 'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
                { 'base': 'Y', 'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
                { 'base': 'Z', 'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
                { 'base': 'a', 'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
                { 'base': 'aa', 'letters': /[\uA733]/g },
                { 'base': 'ae', 'letters': /[\u00E6\u01FD\u01E3]/g },
                { 'base': 'ao', 'letters': /[\uA735]/g },
                { 'base': 'au', 'letters': /[\uA737]/g },
                { 'base': 'av', 'letters': /[\uA739\uA73B]/g },
                { 'base': 'ay', 'letters': /[\uA73D]/g },
                { 'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
                { 'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
                { 'base': 'd', 'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
                { 'base': 'dz', 'letters': /[\u01F3\u01C6]/g },
                { 'base': 'e', 'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
                { 'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
                { 'base': 'g', 'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
                { 'base': 'h', 'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
                { 'base': 'hv', 'letters': /[\u0195]/g },
                { 'base': 'i', 'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
                { 'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
                { 'base': 'k', 'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
                { 'base': 'l', 'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
                { 'base': 'lj', 'letters': /[\u01C9]/g },
                { 'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
                { 'base': 'n', 'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
                { 'base': 'nj', 'letters': /[\u01CC]/g },
                { 'base': 'o', 'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
                { 'base': 'oi', 'letters': /[\u01A3]/g },
                { 'base': 'ou', 'letters': /[\u0223]/g },
                { 'base': 'oo', 'letters': /[\uA74F]/g },
                { 'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
                { 'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
                { 'base': 'r', 'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
                { 'base': 's', 'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
                { 'base': 't', 'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
                { 'base': 'tz', 'letters': /[\uA729]/g },
                { 'base': 'u', 'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
                { 'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
                { 'base': 'vy', 'letters': /[\uA761]/g },
                { 'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
                { 'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
                { 'base': 'y', 'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g },
                { 'base': 'z', 'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g }
            ];
            var str = value;
            for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
            }
            return str;
        };
        return Util;
    }());
    Core.Util = Util;
    var Navigator = (function () {
        function Navigator() {
        }
        Navigator.isGecko = (navigator.userAgent.match(/Gecko\//i) !== null);
        Navigator.isWebkit = (navigator.userAgent.match(/WebKit\//i) !== null);
        Navigator.isIE = (navigator.userAgent.match(/MSIE/i) !== null) || (navigator.userAgent.match(/Trident/i) !== null);
        Navigator.isIE7 = (navigator.userAgent.match(/MSIE 7\./i) !== null);
        Navigator.isIE8 = (navigator.userAgent.match(/MSIE 8\./i) !== null);
        Navigator.isIE10 = (navigator.userAgent.match(/MSIE 10\./i) !== null);
        Navigator.isIE11 = Navigator.isIE && (navigator.userAgent.match(/rv:11\./i) !== null);
        Navigator.isOpera = ((navigator.userAgent === undefined) || (navigator.userAgent.match(/Opera\//i) !== null));
        Navigator.isChrome = (navigator.userAgent.match(/ Chrome\//) !== null);
        Navigator.isSafari = (navigator.userAgent.match(/ Safari\//) !== null);
        Navigator.isFirefox = (navigator.userAgent.match(/ Firefox\//) !== null);
        Navigator.isFirefox3 = (navigator.userAgent.match(/ Firefox\/3\./) !== null);
        Navigator.isFirefox3_5 = (navigator.userAgent.match(/ Firefox\/3\.5\./) !== null);
        Navigator.isFirefox3_6 = (navigator.userAgent.match(/ Firefox\/3\.6\./) !== null);
        Navigator.iPad = (navigator.userAgent.match(/iPad/i) !== null);
        Navigator.iPhone = (navigator.userAgent.match(/iPhone/i) !== null);
        Navigator.iOs = Navigator.iPad || Navigator.iPhone;
        Navigator.Android = (navigator.userAgent.match(/Android/i) !== null);
        Navigator.supportSVG = true;
        Navigator.supportCanvas = true;
        Navigator.supportRgba = true;
        Navigator.supportRgb = true;
        Navigator.supportOpacity = !Navigator.isIE7 && !Navigator.isIE8;
        Navigator.supportFormData = true;
        Navigator.supportFileAPI = true;
        Navigator.supportUploadDirectory = false;
        return Navigator;
    }());
    Core.Navigator = Navigator;
})(Core || (Core = {}));
(function () {
    var test;
    Core.Navigator.supportSVG = false;
    try {
        test = document.createElementNS(svgNS, 'g');
        if ('ownerSVGElement' in test)
            Core.Navigator.supportSVG = true;
    }
    catch (e) { }
    test = document.createElement('canvas');
    Core.Navigator.supportCanvas = 'getContext' in test;
    Core.Navigator.supportRgba = true;
    Core.Navigator.supportRgb = true;
    test = document.createElement('div');
    try {
        test.style.background = 'rgba(0, 0, 0, 0.5)';
    }
    catch (e) {
        Core.Navigator.supportRgba = false;
    }
    try {
        test.style.background = 'rgb(0, 0, 0)';
    }
    catch (e) {
        Core.Navigator.supportRgb = false;
    }
    try {
        new FormData();
    }
    catch (err) {
        Core.Navigator.supportFormData = false;
    }
    var testInput = document.createElement('input');
    Core.Navigator.supportFileAPI = 'files' in testInput;
    Core.Navigator.supportUploadDirectory = 'webkitdirectory' in testInput;
})();
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Core;
(function (Core) {
    var Uri = (function (_super) {
        __extends(Uri, _super);
        function Uri(uri) {
            if (uri === void 0) { uri = null; }
            var _this = _super.call(this) || this;
            var fullpath = true;
            var baseURI;
            if ('baseURI' in document)
                baseURI = document.baseURI;
            else
                baseURI = document.location.href;
            if (uri == null)
                uri = baseURI;
            var res = uri.match(/^([^:\/]+):\/\/([^\/]+)(\/.*)$/);
            if (res === null) {
                fullpath = false;
                res = baseURI.match(/^([^:\/]+):\/\/([^\/]+)(\/.*)$/);
            }
            _this.scheme = res[1];
            var authority = res[2];
            var path = res[3];
            res = authority.match(/^(.+):(.+)@(.*)$/);
            if (res !== null) {
                _this.user = res[1];
                _this.password = res[2];
                authority = res[3];
            }
            res = authority.match(/^(.+):(.+)$/);
            if (res !== null) {
                authority = res[1];
                _this.port = parseInt(res[2]);
            }
            else {
                if (_this.scheme == 'https')
                    _this.port = 443;
                else
                    _this.port = 80;
            }
            _this.host = authority;
            if (fullpath)
                _this.path = path;
            else {
                if (uri.indexOf('/') === 0)
                    _this.path = Uri.cleanPath(uri);
                else
                    _this.path = Uri.mergePath(path, uri);
            }
            return _this;
        }
        Uri.prototype.getScheme = function () {
            return this.scheme;
        };
        Uri.prototype.getUser = function () {
            return this.user;
        };
        Uri.prototype.getPassword = function () {
            return this.password;
        };
        Uri.prototype.getHost = function () {
            return this.host;
        };
        Uri.prototype.getPort = function () {
            return this.port;
        };
        Uri.prototype.getPath = function () {
            return this.path;
        };
        Uri.prototype.getQuery = function () {
            return this.query;
        };
        Uri.prototype.getFragment = function () {
            return this.fragment;
        };
        Uri.prototype.toString = function () {
            var str = this.scheme + '://';
            if ((this.user !== undefined) && (this.password !== undefined))
                str += this.user + ':' + this.password + '@';
            str += this.host;
            if (this.port !== undefined)
                str += ':' + this.port;
            str += this.path;
            return str;
        };
        Uri.cleanPath = function (path) {
            while (path.match(/\/([^\/]*)\/\.\.\//))
                path = path.replace(/\/([^\/]*)\/\.\.\//, '/');
            while (path.match(/\/\//))
                path = path.replace(/\/\//, '/');
            while (path.match(/\/\.\//))
                path = path.replace(/\/\.\//, '/');
            return path;
        };
        Uri.mergePath = function (base, relative) {
            var dir = base.match(/^(.*)\//)[0];
            dir += relative;
            return Uri.cleanPath(dir);
        };
        return Uri;
    }(Core.Object));
    Core.Uri = Uri;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var DoubleLinkedListNode = (function () {
        function DoubleLinkedListNode(data) {
            this.data = data;
        }
        return DoubleLinkedListNode;
    }());
    Core.DoubleLinkedListNode = DoubleLinkedListNode;
    var DoubleLinkedList = (function () {
        function DoubleLinkedList() {
            this.root = undefined;
        }
        DoubleLinkedList.prototype.getLength = function () {
            return this.length;
        };
        DoubleLinkedList.prototype.getFirstNode = function () {
            return this.root;
        };
        DoubleLinkedList.prototype.getLastNode = function () {
            if (this.root === undefined)
                return undefined;
            else
                return this.root.previous;
        };
        DoubleLinkedList.prototype.appendNode = function (node) {
            if (this.root === undefined) {
                node.previous = node;
                node.next = node;
                this.root = node;
            }
            else {
                node.previous = this.root.previous;
                node.next = this.root;
                this.root.previous.next = node;
                this.root.previous = node;
            }
            this.length++;
            return node;
        };
        DoubleLinkedList.prototype.prependNode = function (node) {
            if (this.root === undefined) {
                node.previous = node;
                node.next = node;
                this.root = node;
            }
            else {
                node.previous = this.root.previous;
                node.next = this.root;
                this.root.previous.next = node;
                this.root.previous = node;
                this.root = node;
            }
            this.length++;
            return node;
        };
        DoubleLinkedList.prototype.removeNode = function (node) {
            if (this.root === node) {
                if (node.next === node)
                    this.root = undefined;
                else {
                    node.next.previous = node.previous;
                    node.previous.next = node.next;
                    this.root = node.next;
                }
            }
            else {
                node.next.previous = node.previous;
                node.previous.next = node.next;
            }
            node.next = undefined;
            node.previous = undefined;
            this.length--;
        };
        DoubleLinkedList.prototype.findNode = function (data) {
            if (this.root === undefined)
                return undefined;
            var current = this.root;
            while (current.next !== this.root) {
                if (current.data === data)
                    return current;
                current = current.next;
            }
            return undefined;
        };
        DoubleLinkedList.prototype.getFirst = function () {
            var firstNode = this.getFirstNode();
            if (firstNode === undefined)
                return undefined;
            else
                return firstNode.data;
        };
        DoubleLinkedList.prototype.getLast = function () {
            var lastNode = this.getLastNode();
            if (lastNode === undefined)
                return undefined;
            else
                return lastNode.data;
        };
        DoubleLinkedList.prototype.append = function (data) {
            return this.appendNode(new DoubleLinkedListNode(data));
        };
        DoubleLinkedList.prototype.prepend = function (data) {
            return this.prependNode(new DoubleLinkedListNode(data));
        };
        DoubleLinkedList.prototype.remove = function (data) {
            var node = this.findNode(data);
            if (node !== undefined)
                this.removeNode(node);
        };
        DoubleLinkedList.prototype.clear = function () {
            this.root = undefined;
        };
        DoubleLinkedList.moveNext = function (node) {
            if (node !== undefined)
                return node.next;
            else
                return undefined;
        };
        DoubleLinkedList.prototype.isLast = function (node) {
            if (node === undefined)
                return true;
            else
                return node.next === this.root;
        };
        return DoubleLinkedList;
    }());
    Core.DoubleLinkedList = DoubleLinkedList;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var File = (function (_super) {
        __extends(File, _super);
        function File(config) {
            var _this = _super.call(this) || this;
            _this.iframe = undefined;
            _this.form = undefined;
            _this.fileInput = undefined;
            _this.fileApi = undefined;
            if (config.form !== undefined) {
                _this.form = config.form;
                delete (config.form);
            }
            if (config.iframe !== undefined) {
                _this.iframe = config.iframe;
                delete (config.iframe);
            }
            if (config.fileInput !== undefined) {
                _this.fileInput = config.fileInput;
                delete (config.fileInput);
            }
            if (config.fileApi !== undefined) {
                _this.fileApi = config.fileApi;
                delete (config.fileApi);
            }
            return _this;
        }
        File.prototype.getFileName = function () {
            if (this.fileApi !== undefined)
                return (this.fileApi.fileName !== undefined) ? this.fileApi.fileName : this.fileApi.name;
            else
                return (this.fileInput.fileName !== undefined) ? this.fileInput.fileName : this.fileInput.name;
        };
        File.prototype.getRelativePath = function () {
            var res;
            if (this.fileApi !== undefined) {
                if ('relativePath' in this.fileApi)
                    res = this.fileApi.relativePath;
                else if ('webkitRelativePath' in this.fileApi)
                    res = this.fileApi.webkitRelativePath;
                else if ('mozRelativePath' in this.fileApi)
                    res = this.fileApi.mozRelativePath;
            }
            if (res === '')
                res = undefined;
            return res;
        };
        File.prototype.getMimetype = function () {
            var mimetype = Core.File.getMimetypeFromName(this.getFileName());
            if ((mimetype === 'application/octet-stream') && (this.fileApi !== undefined) && ('type' in this.fileApi))
                mimetype = this.fileApi.type;
            return mimetype;
        };
        File.getMimetypeFromName = function (fileName) {
            var pos = fileName.lastIndexOf('.');
            if (pos === -1)
                return 'application/octet-stream';
            var extension = fileName.substring(pos + 1).toLowerCase();
            var mimetype = Core.File.types[extension];
            if (mimetype === undefined)
                return "application/octet-stream";
            else
                return mimetype;
        };
        File.types = {
            "3dm": "x-world/x-3dmf",
            "3dmf": "x-world/x-3dmf",
            "a": "application/octet-stream",
            "aab": "application/x-authorware-bin",
            "aac": "aaudio/aac",
            "aam": "application/x-authorware-map",
            "aas": "application/x-authorware-seg",
            "abc": "text/vnd.abc",
            "acgi": "text/html",
            "afl": "video/animaflex",
            "ai": "application/postscript",
            "aif": "audio/aiff",
            "aifc": "audio/aiff",
            "aiff": "audio/aiff",
            "aim": "application/x-aim",
            "aip": "text/x-audiosoft-intra",
            "ani": "application/x-navi-animation",
            "aos": "application/x-nokia-9000-communicator-add-on-software",
            "aps": "application/mime",
            "arc": "application/octet-stream",
            "arj": "application/arj",
            "art": "image/x-jg",
            "asf": "video/x-ms-asf",
            "asm": "text/x-asm",
            "asp": "text/asp",
            "asx": "video/x-ms-asf",
            "au": "audio/basic",
            "avi": "video/avi",
            "avs": "video/avs-video",
            "bcpio": "application/x-bcpio",
            "bin": "application/octet-stream",
            "bm": "image/bmp",
            "bmp": "image/bmp",
            "boo": "application/book",
            "book": "application/book",
            "boz": "application/x-bzip2",
            "bsh": "application/x-bsh",
            "bz": "application/x-bzip",
            "bz2": "application/x-bzip2",
            "c": "text/plain",
            "c++": "text/plain",
            "cat": "application/vnd.ms-pki.seccat",
            "cc": "text/plain",
            "ccad": "application/clariscad",
            "cco": "application/x-cocoa",
            "cdf": "application/cdf",
            "cer": "application/pkix-cert",
            "cha": "application/x-chat",
            "chat": "application/x-chat",
            "class": "application/java",
            "com": "application/octet-stream",
            "conf": "text/plain",
            "cpio": "application/x-cpio",
            "cpp": "text/x-c",
            "cpt": "application/x-cpt",
            "crl": "application/pkcs-crl",
            "crt": "application/pkix-cert",
            "csh": "application/x-csh",
            "css": "text/css",
            "cxx": "text/plain",
            "dcr": "application/x-director",
            "deepv": "application/x-deepv",
            "def": "text/plain",
            "der": "application/x-x509-ca-cert",
            "dif": "video/x-dv",
            "dir": "application/x-director",
            "dl": "video/dl",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "dot": "application/msword",
            "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
            "dp": "application/commonground",
            "drw": "application/drafting",
            "dump": "application/octet-stream",
            "dv": "video/x-dv",
            "dvi": "application/x-dvi",
            "dwf": "model/vnd.dwf",
            "dwg": "image/vnd.dwg",
            "dxf": "image/vnd.dwg",
            "dxr": "application/x-director",
            "el": "text/x-script.elisp",
            "elc": "application/x-elc",
            "env": "application/x-envoy",
            "eot": "application/vnd.ms-fontobject",
            "eps": "application/postscript",
            "es": "application/x-esrehber",
            "etx": "text/x-setext",
            "evy": "application/envoy",
            "exe": "application/octet-stream",
            "f": "text/plain",
            "f77": "text/x-fortran",
            "f90": "text/plain",
            "fdf": "application/vnd.fdf",
            "fif": "image/fif",
            "fli": "video/fli",
            "flo": "image/florian",
            "flx": "text/vnd.fmi.flexstor",
            "fmf": "video/x-atomic3d-feature",
            "for": "text/x-fortran",
            "fpx": "image/vnd.fpx",
            "frl": "application/freeloader",
            "funk": "audio/make",
            "g": "text/plain",
            "g3": "image/g3fax",
            "gif": "image/gif",
            "gl": "video/gl",
            "gsd": "audio/x-gsm",
            "gsm": "audio/x-gsm",
            "gsp": "application/x-gsp",
            "gss": "application/x-gss",
            "gtar": "application/x-gtar",
            "gz": "application/x-gzip",
            "gzip": "application/x-gzip",
            "h": "text/plain",
            "hdf": "application/x-hdf",
            "help": "application/x-helpfile",
            "hgl": "application/vnd.hp-hpgl",
            "hh": "text/plain",
            "hlb": "text/x-script",
            "hlp": "application/hlp",
            "hpg": "application/vnd.hp-hpgl",
            "hpgl": "application/vnd.hp-hpgl",
            "hqx": "application/binhex",
            "hta": "application/hta",
            "htc": "text/x-component",
            "htm": "text/html",
            "html": "text/html",
            "htmls": "text/html",
            "htt": "text/webviewhtml",
            "htx": "text/html",
            "ice": "x-conference/x-cooltalk",
            "ico": "image/x-icon",
            "idc": "text/plain",
            "ief": "image/ief",
            "iefs": "image/ief",
            "iges": "application/iges",
            "igs": "application/iges",
            "ima": "application/x-ima",
            "imap": "application/x-httpd-imap",
            "inf": "application/inf",
            "ins": "application/x-internett-signup",
            "ip": "application/x-ip2",
            "isu": "video/x-isvideo",
            "it": "audio/it",
            "iv": "application/x-inventor",
            "ivr": "i-world/i-vrml",
            "ivy": "application/x-livescreen",
            "jam": "audio/x-jam",
            "jav": "text/plain",
            "java": "text/plain",
            "jcm": "application/x-java-commerce",
            "jfif": "image/jpeg",
            "jfif-tbnl": "image/jpeg",
            "jpe": "image/jpeg",
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "jps": "image/x-jps",
            "js": "application/javascript",
            "jut": "image/jutvision",
            "kar": "audio/midi",
            "ksh": "application/x-ksh",
            "la": "audio/nspaudio",
            "lam": "audio/x-liveaudio",
            "latex": "application/x-latex",
            "lha": "application/octet-stream",
            "lhx": "application/octet-stream",
            "list": "text/plain",
            "lma": "audio/nspaudio",
            "log": "text/plain",
            "lsp": "application/x-lisp",
            "lst": "text/plain",
            "lsx": "text/x-la-asf",
            "ltx": "application/x-latex",
            "lzh": "application/octet-stream",
            "lzx": "application/octet-stream",
            "m": "text/plain",
            "m1v": "video/mpeg",
            "m2a": "audio/mpeg",
            "m2v": "video/mpeg",
            "m3u": "audio/x-mpequrl",
            "m4a": "audio/mp4",
            "m4v": "video/mp4",
            "man": "application/x-troff-man",
            "map": "application/x-navimap",
            "mar": "text/plain",
            "mbd": "application/mbedlet",
            "mc$": "application/x-magic-cap-package-1.0",
            "mcd": "application/mcad",
            "mcf": "text/mcf",
            "mcp": "application/netmc",
            "me": "application/x-troff-me",
            "mht": "message/rfc822",
            "mhtml": "message/rfc822",
            "mid": "audio/midi",
            "midi": "audio/midi",
            "mif": "application/x-mif",
            "mime": "message/rfc822",
            "mjf": "audio/x-vnd.audioexplosion.mjuicemediafile",
            "mjpg": "video/x-motion-jpeg",
            "mm": "application/base64",
            "mme": "application/base64",
            "mod": "audio/mod",
            "moov": "video/quicktime",
            "mov": "video/quicktime",
            "movie": "video/x-sgi-movie",
            "mp2": "audio/mpeg",
            "mp3": "audio/mpeg",
            "mp4": "video/mp4",
            "mpa": "audio/mpeg",
            "mpc": "application/x-project",
            "mpe": "video/mpeg",
            "mpeg": "video/mpeg",
            "mpg": "video/mpeg",
            "mpga": "audio/mpeg",
            "mpp": "application/vnd.ms-project",
            "mpt": "application/vnd.ms-project",
            "mpv": "application/vnd.ms-project",
            "mpx": "application/vnd.ms-project",
            "mrc": "application/marc",
            "ms": "application/x-troff-ms",
            "mv": "video/x-sgi-movie",
            "my": "audio/make",
            "mzz": "application/x-vnd.audioexplosion.mzz",
            "nap": "image/naplps",
            "naplps": "image/naplps",
            "nc": "application/x-netcdf",
            "ncm": "application/vnd.nokia.configuration-message",
            "nif": "image/x-niff",
            "niff": "image/x-niff",
            "nix": "application/x-mix-transfer",
            "nsc": "application/x-conference",
            "nvd": "application/x-navidoc",
            "o": "application/octet-stream",
            "oda": "application/oda",
            "odb": "application/vnd.oasis.opendocument.database",
            "odc": "application/vnd.oasis.opendocument.chart",
            "odf": "application/vnd.oasis.opendocument.formula",
            "odg": "application/vnd.oasis.opendocument.graphics",
            "odi": "application/vnd.oasis.opendocument.image",
            "odm": "application/vnd.oasis.opendocument.text-master",
            "odp": "application/vnd.oasis.opendocument.presentation",
            "ods": "application/vnd.oasis.opendocument.spreadsheet",
            "odt": "application/vnd.oasis.opendocument.text",
            "ogg": "audio/ogg",
            "omc": "application/x-omc",
            "omcd": "application/x-omcdatamaker",
            "omcr": "application/x-omcregerator",
            "otg": "application/vnd.oasis.opendocument.graphics-template",
            "otp": "application/vnd.oasis.opendocument.presentation-template",
            "ots": "application/vnd.oasis.opendocument.spreadsheet-template",
            "ott": "application/vnd.oasis.opendocument.text-template",
            "p": "text/x-pascal",
            "p10": "application/pkcs10",
            "p12": "application/pkcs-12",
            "p7a": "application/x-pkcs7-signature",
            "p7c": "application/pkcs7-mime",
            "p7m": "application/pkcs7-mime",
            "p7r": "application/x-pkcs7-certreqresp",
            "p7s": "application/pkcs7-signature",
            "part": "application/pro_eng",
            "pas": "text/pascal",
            "pbm": "image/x-portable-bitmap",
            "pcl": "application/vnd.hp-pcl",
            "ct": "image/x-pict",
            "pcx": "image/x-pcx",
            "pdb": "chemical/x-pdb",
            "pdf": "application/pdf",
            "pfunk": "audio/make",
            "pgm": "image/x-portable-greymap",
            "pic": "image/pict",
            "pict": "image/pict",
            "kg": "application/x-newton-compatible-pkg",
            "pko": "application/vnd.ms-pki.pko",
            "pl": "text/plain",
            "plx": "application/x-pixclscript",
            "pm": "image/x-xpixmap",
            "pm4": "application/x-pagemaker",
            "pm5": "application/x-pagemaker",
            "png": "image/png",
            "pnm": "application/x-portable-anymap",
            "pot": "application/vnd.ms-powerpoint",
            "ov": "model/x-pov",
            "ppa": "application/vnd.ms-powerpoint",
            "ppm": "image/x-portable-pixmap",
            "pps": "application/vnd.ms-powerpoint",
            "ppt": "application/vnd.ms-powerpoint",
            "ppz": "application/vnd.ms-powerpoint",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
            "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
            "pre": "application/x-freelance",
            "prt": "application/pro_eng",
            "ps": "application/postscript",
            "psd": "application/octet-stream",
            "pvu": "paleovu/x-pv",
            "pwz": "application/vnd.ms-powerpoint",
            "py": "text/x-script.phyton",
            "pyc": "applicaiton/x-bytecode.python",
            "qcp": "audio/vnd.qcelp",
            "qd3": "x-world/x-3dmf",
            "qd3d": "x-world/x-3dmf",
            "qif": "image/x-quicktime",
            "qt": "video/quicktime",
            "qtc": "video/x-qtc",
            "qti": "image/x-quicktime",
            "qtif": "image/x-quicktime",
            "ra": "audio/x-pn-realaudio",
            "ram": "audio/x-pn-realaudio",
            "ras": "application/x-cmu-raster",
            "rast": "image/cmu-raster",
            "rexx": "text/x-script.rexx",
            "rf": "image/vnd.rn-realflash",
            "rgb": "image/x-rgb",
            "rm": "application/vnd.rn-realmedia",
            "rmi": "audio/mid",
            "rmm": "audio/x-pn-realaudio",
            "rmp": "audio/x-pn-realaudio",
            "rng": "application/ringing-tones",
            "rnx": "application/vnd.rn-realplayer",
            "roff": "application/x-troff",
            "rp": "image/vnd.rn-realpix",
            "rpm": "audio/x-pn-realaudio-plugin",
            "rt": "text/richtext",
            "rtf": "text/richtext",
            "rtx": "text/richtext",
            "rv": "video/vnd.rn-realvideo",
            "s": "text/x-asm",
            "s3m": "audio/s3m",
            "saveme": "application/octet-stream",
            "sbk": "application/x-tbook",
            "scm": "application/x-lotusscreencam",
            "sdml": "text/plain",
            "sdp": "application/sdp",
            "sdr": "application/sounder",
            "sea": "application/sea",
            "set": "application/set",
            "sgm": "text/sgml",
            "sgml": "text/sgml",
            "sh": "application/x-sh",
            "shar": "application/x-shar",
            "shtml": "text/html",
            "sid": "audio/x-psid",
            "sit": "application/x-sit",
            "skd": "application/x-koan",
            "skm": "application/x-koan",
            "skp": "application/x-koan",
            "skt": "application/x-koan",
            "sl": "application/x-seelogo",
            "smi": "application/smil",
            "smil": "application/smil",
            "snd": "audio/basic",
            "sol": "application/solids",
            "spc": "text/x-speech",
            "spl": "application/futuresplash",
            "spr": "application/x-sprite",
            "sprite": "application/x-sprite",
            "src": "application/x-wais-source",
            "ssi": "text/x-server-parsed-html",
            "ssm": "application/streamingmedia",
            "sst": "application/vnd.ms-pki.certstore",
            "step": "application/step",
            "stl": "application/sla",
            "stp": "application/step",
            "sv4cpio": "application/x-sv4cpio",
            "sv4crc": "application/x-sv4crc",
            "svf": "image/vnd.dwg",
            "svg": "image/svg+xml",
            "svr": "application/x-world",
            "swf": "application/x-shockwave-flash",
            "sxw": "application/vnd.sun.xml.writer",
            "t": "application/x-troff",
            "talk": "text/x-speech",
            "tar": "application/x-tar",
            "tbk": "application/toolbook",
            "tcl": "application/x-tcl",
            "tcsh": "text/x-script.tcsh",
            "tex": "application/x-tex",
            "texi": "application/x-texinfo",
            "texinfo": "application/x-texinfo",
            "text": "text/plain",
            "tgz": "application/x-compressed",
            "tif": "image/tiff",
            "tiff": "image/tiff",
            "tr": "application/x-troff",
            "tsi": "audio/tsp-audio",
            "tsp": "application/dsptype",
            "tsv": "text/tab-separated-values",
            "ttf": "font/ttf",
            "turbot": "image/florian",
            "txt": "text/plain",
            "uil": "text/x-uil",
            "uni": "text/uri-list",
            "unis": "text/uri-list",
            "unv": "application/i-deas",
            "uri": "text/uri-list",
            "uris": "text/uri-list",
            "ustar": "application/x-ustar",
            "uu": "application/octet-stream",
            "uue": "text/x-uuencode",
            "vcd": "application/x-cdlink",
            "vcs": "text/x-vcalendar",
            "vda": "application/vda",
            "vdo": "video/vdo",
            "vew": "application/groupwise",
            "viv": "video/vivo",
            "vivo": "video/vivo",
            "vmd": "application/vocaltec-media-desc",
            "vmf": "application/vocaltec-media-file",
            "voc": "audio/voc",
            "vos": "video/vosaic",
            "vox": "audio/voxware",
            "vqe": "audio/x-twinvq-plugin",
            "vqf": "audio/x-twinvq",
            "vql": "audio/x-twinvq-plugin",
            "vrml": "application/x-vrml",
            "vrt": "x-world/x-vrt",
            "vsd": "application/x-visio",
            "vst": "application/x-visio",
            "vsw": "application/x-visio",
            "w60": "application/wordperfect6.0",
            "w61": "application/wordperfect6.1",
            "w6w": "application/msword",
            "wav": "audio/wav",
            "wb1": "application/x-qpro",
            "wbmp": "image/vnd.wap.wbmp",
            "web": "application/vnd.xara",
            "weba": "audio/webm",
            "webm": "video/webm",
            "webp": "image/webp",
            "wiz": "application/msword",
            "wk1": "application/x-123",
            "wmf": "windows/metafile",
            "wml": "text/vnd.wap.wml",
            "wmlc": "application/vnd.wap.wmlc",
            "wmls": "text/vnd.wap.wmlscript",
            "wmlsc": "application/vnd.wap.wmlscriptc",
            "woff": "application/font-woff",
            "word": "application/msword",
            "wp": "application/wordperfect",
            "wp5": "application/wordperfect",
            "wp6": "application/wordperfect",
            "wpd": "application/wordperfect",
            "wq1": "application/x-lotus",
            "wri": "application/mswrite",
            "wrl": "application/x-world",
            "wrz": "x-world/x-vrml",
            "wsc": "text/scriplet",
            "wsrc": "application/x-wais-source",
            "wtk": "application/x-wintalk",
            "xbm": "image/x-xbitmap",
            "xdr": "video/x-amt-demorun",
            "xgz": "xgl/drawing",
            "xif": "image/vnd.xiff",
            "xl": "application/excel",
            "xla": "application/vnd.ms-excel",
            "xlb": "application/vnd.ms-excel",
            "xlc": "application/vnd.ms-excel",
            "xld": "application/vnd.ms-excel",
            "xlk": "application/vnd.ms-excel",
            "xll": "application/vnd.ms-excel",
            "xlm": "application/vnd.ms-excel",
            "xls": "application/vnd.ms-excel",
            "xlt": "application/vnd.ms-excel",
            "xlv": "application/vnd.ms-excel",
            "xlw": "application/vnd.ms-excel",
            "xm": "audio/xm",
            "xml": "application/xml",
            "xmz": "xgl/movie",
            "xpix": "application/x-vnd.ls-xpix",
            "xpm": "image/xpm",
            "x-png": "image/png",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
            "xsr": "video/x-amt-showrun",
            "xwd": "image/x-xwd",
            "xyz": "chemical/x-pdb",
            "z": "application/x-compressed",
            "zip": "application/zip",
            "zoo": "application/octet-stream",
            "zsh": "text/x-script.zsh"
        };
        return File;
    }(Core.Object));
    Core.File = File;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var HttpRequest = (function (_super) {
        __extends(HttpRequest, _super);
        function HttpRequest(init) {
            var _this = _super.call(this) || this;
            _this.url = null;
            _this.method = "GET";
            _this.binary = false;
            _this.arguments = undefined;
            _this.content = undefined;
            _this.headers = undefined;
            _this.addEvents('error', 'done');
            _this.request = new XMLHttpRequest();
            var wrapper = function () {
                if (_this.request.readyState == 4) {
                    if ((_this.request.status >= 200) && (_this.request.status < 300))
                        _this.fireEvent('done', _this);
                    else
                        _this.fireEvent('error', _this, _this.request.status);
                }
            };
            _this.request.onreadystatechange = wrapper;
            _this.assign(init);
            return _this;
        }
        HttpRequest.prototype.setRequestHeader = function (header, value) {
            if (this.headers === undefined)
                this.headers = {};
            this.headers[header] = value;
        };
        HttpRequest.prototype.addArgument = function (argName, argValue) {
            if (this.arguments === undefined)
                this.arguments = {};
            this.arguments[argName] = argValue;
        };
        HttpRequest.prototype.abort = function () {
            this.request.abort();
        };
        HttpRequest.prototype.send = function () {
            if (this.url === undefined)
                throw ('url MUST be given for an HttpRequest');
            var header;
            var args = '';
            if (this.arguments !== undefined)
                args = Core.Util.encodeURIQuery(this.arguments);
            var url = this.url;
            if (((this.method === 'GET') || (this.method === 'DELETE') || (this.content !== undefined)) && (args !== '')) {
                if (this.url.indexOf('?') === -1)
                    url += '?' + args;
                else
                    url += '&' + args;
            }
            this.request.open(this.method, url, true);
            if (this.binary)
                this.request.overrideMimeType('text/plain; charset=x-user-defined');
            this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (HttpRequest.requestHeaders !== undefined) {
                for (header in HttpRequest.requestHeaders)
                    this.request.setRequestHeader(header, HttpRequest.requestHeaders[header]);
            }
            if (this.headers !== undefined) {
                for (header in this.headers)
                    this.request.setRequestHeader(header, this.headers[header]);
            }
            if (this.content !== undefined) {
                if ((this.headers === undefined) || (this.headers["Content-Type"] === undefined))
                    this.request.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
                this.request.send(this.content);
            }
            else if ((args !== '') && ((this.method === 'POST') || (this.method === 'PUT'))) {
                if ((this.headers === undefined) || (this.headers["Content-Type"] === undefined))
                    this.request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                this.request.send(args);
            }
            else
                this.request.send();
        };
        HttpRequest.prototype.sendAsync = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this.connect(_this, 'done', function () {
                    resolve(_this);
                });
                _this.send();
            });
        };
        HttpRequest.prototype.getResponseHeader = function (header) {
            return this.request.getResponseHeader(header);
        };
        Object.defineProperty(HttpRequest.prototype, "responseText", {
            get: function () {
                return this.request.responseText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HttpRequest.prototype, "responseBase64", {
            get: function () {
                return Core.Util.toBase64(this.request.responseText);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HttpRequest.prototype, "responseJSON", {
            get: function () {
                var res;
                try {
                    res = JSON.parse(this.responseText);
                }
                catch (err) {
                    res = undefined;
                }
                return res;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HttpRequest.prototype, "responseXML", {
            get: function () {
                var parser = new DOMParser();
                try {
                    var xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
                    return xmlDoc;
                }
                catch (e) { }
                return undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HttpRequest.prototype, "status", {
            get: function () {
                return this.request.status;
            },
            enumerable: true,
            configurable: true
        });
        HttpRequest.setRequestHeader = function (header, value) {
            if (HttpRequest.requestHeaders === undefined)
                HttpRequest.requestHeaders = {};
            HttpRequest.requestHeaders[header] = value;
        };
        HttpRequest.requestHeaders = undefined;
        return HttpRequest;
    }(Core.Object));
    Core.HttpRequest = HttpRequest;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var DelayedTask = (function (_super) {
        __extends(DelayedTask, _super);
        function DelayedTask(scope, delay, callback) {
            var _this = _super.call(this) || this;
            _this.delay = 1;
            _this.scope = undefined;
            _this.isDone = false;
            _this.handle = undefined;
            _this.scope = scope;
            _this.delay = delay;
            _this.callback = callback;
            _this.handle = setTimeout(function () {
                _this.handle = undefined;
                _this.isDone = true;
                _this.callback.apply(_this.scope, [_this]);
            }, _this.delay * 1000);
            return _this;
        }
        DelayedTask.prototype.abort = function () {
            if (this.handle !== undefined) {
                clearTimeout(this.handle);
                this.handle = undefined;
            }
        };
        return DelayedTask;
    }(Core.Object));
    Core.DelayedTask = DelayedTask;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var Timer = (function (_super) {
        __extends(Timer, _super);
        function Timer(config) {
            var _this = _super.call(this) || this;
            _this.interval = 1;
            _this.arguments = undefined;
            _this.handle = undefined;
            _this.addEvents('timeupdate');
            if ('interval' in config) {
                _this.interval = config.interval;
                delete (config.interval);
            }
            if ('arguments' in config) {
                _this.arguments = config.arguments;
                delete (config.arguments);
            }
            else
                _this.arguments = [];
            var wrapper = function () {
                var startTime = (new Date().getTime()) / 1000;
                _this.fireEvent('timeupdate', _this, _this.arguments);
                var endTime = (new Date().getTime()) / 1000;
                var deltaTime = endTime - startTime;
                if (deltaTime < 0)
                    deltaTime = 0;
                var interval = (_this.interval * 1000) - deltaTime;
                if (interval < 0)
                    interval = 0;
                if (_this.handle !== undefined)
                    _this.handle = setTimeout(wrapper, interval);
            };
            _this.handle = setTimeout(wrapper, 0);
            return _this;
        }
        Timer.prototype.abort = function () {
            if (this.handle !== undefined) {
                clearTimeout(this.handle);
                this.handle = undefined;
            }
        };
        return Timer;
    }(Core.Object));
    Core.Timer = Timer;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var Socket = (function (_super) {
        __extends(Socket, _super);
        function Socket(config) {
            var _this = _super.call(this) || this;
            _this.host = undefined;
            _this.service = '/';
            _this.port = 80;
            _this.mode = undefined;
            _this.secure = false;
            _this.websocket = undefined;
            _this.websocketdelay = undefined;
            _this.emuopenrequest = undefined;
            _this.emupollrequest = undefined;
            _this.emusendrequest = undefined;
            _this.emuid = undefined;
            _this.emumessages = undefined;
            _this.lastPosition = 0;
            _this.readSize = true;
            _this.size = 0;
            _this.data = '';
            _this.isClosed = false;
            _this.closeSent = false;
            _this.sep = '?';
            _this.lastPoll = undefined;
            _this.delayPollTask = undefined;
            _this.pollInterval = 2.5;
            _this.addEvents('error', 'message', 'close', 'open');
            if ('host' in config) {
                _this.host = config.host;
                delete (config.host);
            }
            else
                _this.host = document.location.hostname;
            if ('secure' in config) {
                _this.secure = config.secure;
                delete (config.secure);
            }
            else {
                _this.secure = (document.location.protocol === 'https:');
            }
            if ('port' in config) {
                _this.port = config.port;
                delete (config.port);
            }
            else if ((document.location.port !== undefined) && (document.location.port !== ''))
                _this.port = parseInt(document.location.port);
            else {
                if (_this.secure)
                    _this.port = 443;
                else
                    _this.port = 80;
            }
            if ('service' in config) {
                _this.service = config.service;
                delete (config.service);
                if (_this.service.indexOf('?') == -1)
                    _this.sep = '?';
                else
                    _this.sep = '&';
            }
            if ('mode' in config) {
                _this.mode = config.mode;
                delete (config.mode);
            }
            else {
                if (Core.Socket.supportWebSocket)
                    _this.mode = 'websocket';
                else
                    _this.mode = 'poll';
            }
            if (_this.mode == 'websocket') {
                _this.websocket = new WebSocket((_this.secure ? 'wss' : 'ws') + '://' + _this.host + ':' + _this.port + _this.service);
                _this.websocketdelay = new Core.DelayedTask(_this, 30, _this.onWebSocketOpenTimeout);
                _this.connect(_this.websocket, 'open', _this.onWebSocketOpen);
                _this.connect(_this.websocket, 'error', _this.onWebSocketError);
                _this.connect(_this.websocket, 'message', _this.onWebSocketMessage);
                _this.connect(_this.websocket, 'close', _this.onWebSocketClose);
            }
            else {
                _this.emumessages = [];
                var url = (_this.secure ? 'https' : 'http') + '://' + _this.host + ':' + _this.port + _this.service + _this.sep + 'socket=poll&command=open';
                _this.emuopenrequest = new Core.HttpRequest({ url: url });
                _this.connect(_this.emuopenrequest, 'done', _this.onEmuSocketOpenDone);
                _this.connect(_this.emuopenrequest, 'error', _this.onEmuSocketOpenError);
                _this.emuopenrequest.send();
            }
            return _this;
        }
        Socket.prototype.send = function (msg) {
            if (this.websocket !== undefined) {
                this.websocket.send(msg);
            }
            else {
                if (this.emusendrequest === undefined) {
                    var url = (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=' + this.mode + '&command=send&id=' + this.emuid + '&messages=' + encodeURIComponent(msg.toBase64());
                    this.emusendrequest = new Core.HttpRequest({ url: url });
                    this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
                    this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
                    this.emusendrequest.send();
                    if (this.delayPollTask !== undefined) {
                        this.delayPollTask.abort();
                        this.delayPollTask = new Core.DelayedTask(this, 0.1, this.delayPollDone);
                    }
                }
                else
                    this.emumessages.push(msg.toBase64());
            }
        };
        Socket.prototype.close = function () {
            if (this.delayPollTask !== undefined) {
                this.delayPollTask.abort();
                this.delayPollTask = undefined;
            }
            if (this.websocket !== undefined) {
                this.isClosed = true;
                this.websocket.close();
            }
            else {
                if (!this.isClosed) {
                    this.isClosed = true;
                    if (this.emuopenrequest !== undefined) {
                        this.emuopenrequest.abort();
                        this.emuopenrequest = undefined;
                    }
                    else if (this.emuid !== undefined) {
                        if (this.emusendrequest === undefined) {
                            this.closeSent = true;
                            this.emusendrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=' + this.mode + '&command=close&id=' + this.emuid });
                            this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
                            this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
                            this.emusendrequest.send();
                        }
                    }
                }
            }
        };
        Socket.prototype.onWebSocketOpenTimeout = function () {
            this.websocketdelay = undefined;
            this.disconnect(this.websocket, 'open', this.onWebSocketOpen);
            this.disconnect(this.websocket, 'error', this.onWebSocketError);
            this.disconnect(this.websocket, 'message', this.onWebSocketMessage);
            this.disconnect(this.websocket, 'close', this.onWebSocketClose);
            this.websocket.close();
            this.websocket = undefined;
            this.mode = 'poll';
            this.emumessages = [];
            this.emuopenrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=poll&command=open' });
            this.connect(this.emuopenrequest, 'done', this.onEmuSocketOpenDone);
            this.connect(this.emuopenrequest, 'error', this.onEmuSocketOpenError);
            this.emuopenrequest.send();
        };
        Socket.prototype.onWebSocketOpen = function () {
            if (this.websocketdelay !== undefined) {
                this.websocketdelay.abort();
                this.websocketdelay = undefined;
            }
            this.fireEvent('open', this);
        };
        Socket.prototype.onWebSocketError = function () {
            if (this.websocketdelay !== undefined) {
                this.websocketdelay.abort();
                this.websocketdelay = undefined;
            }
            this.fireEvent('error', this);
        };
        Socket.prototype.onWebSocketMessage = function (msg) {
            if (msg.data === 'PING')
                this.websocket.send('PONG');
            else
                this.fireEvent('message', this, msg.data);
        };
        Socket.prototype.onWebSocketClose = function (msg) {
            if (this.websocketdelay !== undefined) {
                this.websocketdelay.abort();
                this.websocketdelay = undefined;
            }
            this.fireEvent('close', this);
        };
        Socket.prototype.emuSocketDataAvailable = function (data) {
            if (this.emuid === undefined) {
                this.emuid = data;
                this.fireEvent('open', this);
            }
            else {
                if (data !== 'keepalive')
                    this.fireEvent('message', this, data.fromBase64());
            }
        };
        Socket.prototype.emuSocketUpdate = function (delta) {
            for (var i = 0; i < delta.length; i++) {
                var character = delta[i];
                if (this.readSize) {
                    if (character === ':') {
                        this.readSize = false;
                        this.size = parseInt('0x' + this.data);
                        this.data = '';
                    }
                    else
                        this.data += character;
                }
                else {
                    this.data += character;
                    if (this.data.length >= this.size + 2) {
                        this.emuSocketDataAvailable(this.data.substring(0, this.data.length - 2));
                        this.readSize = true;
                        this.data = '';
                    }
                }
            }
        };
        Socket.prototype.onEmuSocketSendDone = function () {
            var response = this.emusendrequest.getResponseJSON();
            if (this.emumessages.length > 0) {
                var messages = '';
                for (var i = 0; i < this.emumessages.length; i++) {
                    if (messages !== '')
                        messages += ';';
                    messages += this.emumessages[i];
                }
                this.emusendrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=' + this.mode + '&command=send&id=' + this.emuid + '&messages=' + encodeURIComponent(messages) });
                this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
                this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
                this.emusendrequest.send();
                this.emumessages = [];
            }
            else if (this.isClosed && !this.closeSent) {
                this.emusendrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=' + this.mode + '&command=close&id=' + this.emuid });
                this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
                this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
                this.emusendrequest.send();
            }
            else
                this.emusendrequest = undefined;
        };
        Socket.prototype.onEmuSocketSendError = function () {
            this.emusendrequest = undefined;
        };
        Socket.prototype.onEmuSocketOpenDone = function () {
            this.lastPoll = new Date();
            var response = this.emuopenrequest.getResponseJSON();
            this.emuopenrequest = undefined;
            if (response === undefined) {
                this.fireEvent('error', this);
                this.fireEvent('close', this);
            }
            else {
                this.emuid = response.id;
                if ('keepAliveInterval' in response)
                    this.pollInterval = Math.min(response.keepAliveInterval, 2.5);
                if (response.status != 'open') {
                    this.fireEvent('error', this);
                    this.fireEvent('close', this);
                }
                else {
                    this.fireEvent('open', this);
                    this.emupollrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=poll&command=poll&id=' + this.emuid });
                    this.connect(this.emupollrequest, 'done', this.onEmuSocketPollDone);
                    this.connect(this.emupollrequest, 'error', this.onEmuSocketPollError);
                    this.emupollrequest.send();
                }
            }
        };
        Socket.prototype.onEmuSocketOpenError = function (request, status) {
            this.emuopenrequest = undefined;
            this.fireEvent('error', this);
            this.fireEvent('close', this);
        };
        Socket.prototype.onEmuSocketPollDone = function () {
            var response = this.emupollrequest.getResponseJSON();
            this.emupollrequest = undefined;
            if (response === undefined) {
                this.close();
                this.fireEvent('close', this);
            }
            else {
                if (response.messages !== undefined) {
                    for (var i = 0; i < response.messages.length; i++) {
                        var msg = response.messages[i].fromBase64();
                        this.fireEvent('message', this, msg);
                    }
                }
                if (response.status !== 'open') {
                    this.close();
                    this.fireEvent('close', this);
                }
                else {
                    var now = new Date();
                    var deltaMs = Math.max(0, now.getTime() - this.lastPoll.getTime());
                    this.lastPoll = now;
                    if (deltaMs >= this.pollInterval * 1000)
                        this.sendPoll();
                    else
                        this.delayPollTask = new Core.DelayedTask(this, this.pollInterval, this.delayPollDone);
                }
            }
        };
        Socket.prototype.onEmuSocketPollError = function () {
            this.emupollrequest = undefined;
            this.fireEvent('error', this);
            this.close();
        };
        Socket.prototype.delayPollDone = function () {
            this.delayPollTask = undefined;
            if (this.emupollrequest === undefined)
                this.sendPoll();
        };
        Socket.prototype.sendPoll = function () {
            var now = new Date();
            this.lastPoll = now;
            this.emupollrequest = new Core.HttpRequest({ url: (this.secure ? 'https' : 'http') + '://' + this.host + ':' + this.port + this.service + this.sep + 'socket=poll&command=poll&id=' + this.emuid });
            this.connect(this.emupollrequest, 'done', this.onEmuSocketPollDone);
            this.connect(this.emupollrequest, 'error', this.onEmuSocketPollError);
            this.emupollrequest.send();
        };
        Socket.supportWebSocket = true;
        return Socket;
    }(Core.Object));
    Core.Socket = Socket;
})(Core || (Core = {}));
Core.Socket.supportWebSocket = "WebSocket" in window;
var Core;
(function (Core) {
    var RemoteDebug = (function (_super) {
        __extends(RemoteDebug, _super);
        function RemoteDebug(config) {
            var _this = _super.call(this) || this;
            _this.host = undefined;
            _this.port = undefined;
            _this.socket = undefined;
            _this.socketAlive = false;
            _this.retryTask = undefined;
            _this.nativeConsole = undefined;
            _this.buffer = [];
            Core.RemoteDebug.current = _this;
            _this.host = config.host;
            delete (config.host);
            _this.port = config.port;
            delete (config.port);
            _this.nativeConsole = window.console;
            window.console = {
                log: Core.RemoteDebug.onConsoleLog,
                error: Core.RemoteDebug.onConsoleError,
                warn: Core.RemoteDebug.onConsoleWarn
            };
            window.onerror = Core.RemoteDebug.onError;
            _this.startSocket();
            return _this;
        }
        RemoteDebug.prototype.startSocket = function () {
            this.socket = new Core.Socket({ service: '/', host: this.host, port: this.port });
            this.connect(this.socket, 'open', this.onSocketOpen);
            this.connect(this.socket, 'message', this.onSocketMessage);
            this.connect(this.socket, 'error', this.onSocketError);
            this.connect(this.socket, 'close', this.onSocketClose);
        };
        RemoteDebug.prototype.onSocketOpen = function () {
            this.socketAlive = true;
            while (this.buffer.length > 0) {
                this.socket.send(this.buffer.shift());
            }
        };
        RemoteDebug.prototype.onSocketMessage = function (socket, message) {
            eval(message);
        };
        RemoteDebug.prototype.onSocketError = function () {
            this.socketAlive = false;
            this.socket.close();
        };
        RemoteDebug.prototype.onSocketClose = function () {
            this.socketAlive = false;
            this.disconnect(this.socket, 'error', this.onSocketError);
            this.disconnect(this.socket, 'close', this.onSocketClose);
            this.socket = undefined;
            this.retryTask = new Core.DelayedTask(this, 5, this.startSocket);
        };
        RemoteDebug.prototype.onConsoleLog = function (message) {
            if (this.socketAlive)
                this.socket.send(JSON.stringify({ type: 'log', message: message }));
            else
                this.buffer.push(JSON.stringify({ type: 'log', message: message }));
        };
        RemoteDebug.prototype.onConsoleError = function (message) {
            if (this.socketAlive)
                this.socket.send(JSON.stringify({ type: 'error', message: message }));
            else
                this.buffer.push(JSON.stringify({ type: 'error', message: message }));
        };
        RemoteDebug.prototype.onConsoleWarn = function (message) {
            if (this.socketAlive)
                this.socket.send(JSON.stringify({ type: 'warn', message: message }));
            else
                this.buffer.push(JSON.stringify({ type: 'warn', message: message }));
        };
        RemoteDebug.prototype.onError = function (message, url, line) {
            if (this.socketAlive)
                this.socket.send(JSON.stringify({ type: 'warn', message: message, url: url, line: line }));
            else
                this.buffer.push(JSON.stringify({ type: 'warn', message: message, url: url, line: line }));
        };
        RemoteDebug.onConsoleLog = function (message) {
            Core.RemoteDebug.current.onConsoleLog.call(Core.RemoteDebug.current, message);
        };
        RemoteDebug.onConsoleError = function (message) {
            Core.RemoteDebug.current.onConsoleError.call(Core.RemoteDebug.current, message);
        };
        RemoteDebug.onConsoleWarn = function (message) {
            Core.RemoteDebug.current.onConsoleWarn.call(Core.RemoteDebug.current, message);
        };
        RemoteDebug.onError = function (message, url, line) {
            Core.RemoteDebug.current.onError.call(Core.RemoteDebug.current, message, url, line);
        };
        RemoteDebug.current = undefined;
        return RemoteDebug;
    }(Core.Object));
    Core.RemoteDebug = RemoteDebug;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var FilePostUploader = (function (_super) {
        __extends(FilePostUploader, _super);
        function FilePostUploader(init) {
            var _this = _super.call(this) || this;
            _this.binaryString = false;
            _this._method = 'POST';
            _this._isCompleted = false;
            _this.addEvents('progress', 'complete', 'error');
            _this.fields = {};
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(FilePostUploader.prototype, "method", {
            set: function (method) {
                this._method = method;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilePostUploader.prototype, "file", {
            get: function () {
                return this._file;
            },
            set: function (file) {
                this._file = file;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilePostUploader.prototype, "service", {
            set: function (service) {
                this._service = service;
            },
            enumerable: true,
            configurable: true
        });
        FilePostUploader.prototype.setField = function (name, value) {
            this.fields[name] = value;
        };
        Object.defineProperty(FilePostUploader.prototype, "destination", {
            set: function (destination) {
                this.setField('destination', destination);
            },
            enumerable: true,
            configurable: true
        });
        FilePostUploader.prototype.send = function () {
            var _this = this;
            var wrapper;
            var field;
            if (this._file.fileApi !== undefined) {
                if (Core.Navigator.supportFormData) {
                    var formData = new FormData();
                    for (field in this.fields) {
                        formData.append(field, this.fields[field]);
                    }
                    formData.append("file", this._file.fileApi);
                    this.request = new XMLHttpRequest();
                    if ('upload' in this.request)
                        this.connect(this.request.upload, 'progress', this.onUpdateProgress);
                    this.request.open(this._method, this._service);
                    this.request.send(formData);
                    this.request.onreadystatechange = function (event) { return _this.onStateChange(event); };
                }
                else {
                    this.fileReader = new FileReader();
                    this.request = new XMLHttpRequest();
                    if ('upload' in this.request)
                        this.connect(this.request.upload, 'progress', this.onUpdateProgress);
                    this.request.open(this._method, this._service);
                    this.boundary = '----';
                    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    for (var i = 0; i < 16; i++)
                        this.boundary += characters[Math.floor(Math.random() * characters.length)];
                    this.boundary += '----';
                    this.request.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + this.boundary);
                    this.request.setRequestHeader("Content-Length", this._file.fileApi.size);
                    this.request.onreadystatechange = function (event) { return _this.onStateChange(event); };
                    this.fileReader.onload = function (event) { return _this.onFileReaderLoad(event); };
                    this.fileReader.onerror = function (event) { return _this.onFileReaderError(event); };
                    this.fileReader.readAsBinaryString(this._file.fileApi);
                }
            }
            else {
                this._file.form.action = this._service;
                for (field in this.fields) {
                    var fieldDrawing = document.createElement('input');
                    fieldDrawing.type = 'hidden';
                    fieldDrawing.setAttribute('name', field);
                    fieldDrawing.setAttribute('value', this.fields[field]);
                    this._file.form.insertBefore(fieldDrawing, this._file.form.firstChild);
                }
                this.connect(this._file.iframe, 'load', this.onIFrameLoad);
                var errorCount = 0;
                var done = false;
                while (!done && (errorCount < 5)) {
                    try {
                        this._file.form.submit();
                        done = true;
                    }
                    catch (e) {
                        errorCount++;
                    }
                }
            }
        };
        FilePostUploader.prototype.abort = function () {
            if (this.request !== undefined) {
                this.request.abort();
                this.request = undefined;
            }
        };
        FilePostUploader.prototype.getResponseText = function () {
            return this.responseText;
        };
        FilePostUploader.prototype.getResponseJSON = function () {
            var res;
            try {
                res = JSON.parse(this.getResponseText());
            }
            catch (err) {
                res = undefined;
            }
            return res;
        };
        Object.defineProperty(FilePostUploader.prototype, "isCompleted", {
            get: function () {
                return this._isCompleted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilePostUploader.prototype, "total", {
            get: function () {
                return this.totalOctets;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilePostUploader.prototype, "loaded", {
            get: function () {
                return this.loadedOctets;
            },
            enumerable: true,
            configurable: true
        });
        FilePostUploader.prototype.onStateChange = function (event) {
            if (this.request.readyState == 4) {
                this._isCompleted = true;
                if (this.request.status == 200) {
                    this.responseText = this.request.responseText;
                    this.fireEvent('complete', this);
                }
                else {
                    this.responseText = this.request.responseText;
                    this.fireEvent('error', this, this.request.status);
                }
                this.request = undefined;
            }
        };
        FilePostUploader.prototype.onUpdateProgress = function (event) {
            this.loadedOctets = event.loaded;
            this.totalOctets = event.total;
            this.fireEvent('progress', this, event.loaded, event.total);
        };
        FilePostUploader.prototype.onFileReaderError = function (event) {
            this.request.abort();
            this.request = undefined;
            this.fireEvent('error', this);
            this.fileReader = undefined;
        };
        FilePostUploader.prototype.onFileReaderLoad = function (event) {
            var body = '--' + this.boundary + '\r\n';
            body += "Content-Disposition: form-data; name='file'; filename='" + this._file.fileApi.name + "'\r\n";
            body += 'Content-Type: ' + this._file.fileApi.type + '\r\n\r\n';
            body += event.target.result + '\r\n';
            body += '--' + this.boundary + '--';
            this.request.sendAsBinary(body);
            this.fileReader = undefined;
        };
        FilePostUploader.prototype.onIFrameLoad = function (event) {
            this.responseText = event.target.contentWindow.document.body.innerText;
            document.body.removeChild(this._file.iframe);
            this.fireEvent('complete', this);
        };
        return FilePostUploader;
    }(Core.Object));
    Core.FilePostUploader = FilePostUploader;
})(Core || (Core = {}));
var Anim;
(function (Anim) {
    var EasingFunction = (function (_super) {
        __extends(EasingFunction, _super);
        function EasingFunction(init) {
            var _this = _super.call(this) || this;
            _this.mode = 'in';
            if (init)
                _this.assign(init);
            return _this;
        }
        EasingFunction.prototype.ease = function (normalizedTime) {
            if (this.mode == 'in')
                return this.easeInCore(normalizedTime);
            else if (this.mode == 'out')
                return 1 - this.easeInCore(1 - normalizedTime);
            else {
                if (normalizedTime <= 0.5)
                    return this.easeInCore(normalizedTime * 2.0) / 2.0;
                else
                    return 0.5 + ((1 - this.easeInCore(2.0 - (normalizedTime * 2.0))) / 2.0);
            }
        };
        EasingFunction.prototype.easeInCore = function (normalizedTime) {
            return normalizedTime;
        };
        EasingFunction.register = function (easeName, classType) {
            this.eases[easeName] = classType;
        };
        EasingFunction.parse = function (ease) {
            return new this.eases[ease]();
        };
        EasingFunction.create = function (ease) {
            if (ease instanceof EasingFunction)
                return ease;
            else
                return EasingFunction.parse(ease);
        };
        EasingFunction.eases = {};
        return EasingFunction;
    }(Core.Object));
    Anim.EasingFunction = EasingFunction;
})(Anim || (Anim = {}));
var Anim;
(function (Anim) {
    var LinearEase = (function (_super) {
        __extends(LinearEase, _super);
        function LinearEase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LinearEase.prototype.easeInCore = function (normalizedTime) {
            return normalizedTime;
        };
        return LinearEase;
    }(Anim.EasingFunction));
    Anim.LinearEase = LinearEase;
})(Anim || (Anim = {}));
Anim.EasingFunction.register('linear', Anim.LinearEase);
var Anim;
(function (Anim) {
    var PowerEase = (function (_super) {
        __extends(PowerEase, _super);
        function PowerEase(init) {
            var _this = _super.call(this) || this;
            _this.power = 2;
            if (init)
                _this.assign(init);
            return _this;
        }
        PowerEase.prototype.easeInCore = function (normalizedTime) {
            return Math.pow(normalizedTime, this.power);
        };
        return PowerEase;
    }(Anim.EasingFunction));
    Anim.PowerEase = PowerEase;
})(Anim || (Anim = {}));
Anim.EasingFunction.register('power', Anim.PowerEase);
var Anim;
(function (Anim) {
    var BounceEase = (function (_super) {
        __extends(BounceEase, _super);
        function BounceEase(init) {
            var _this = _super.call(this) || this;
            _this.bounces = 3;
            _this.bounciness = 2.0;
            if (init)
                _this.assign(init);
            return _this;
        }
        BounceEase.prototype.easeInCore = function (normalizedTime) {
            var sq = Math.exp((1.0 / this.bounciness) * Math.log(normalizedTime));
            var step = Math.floor(sq * (this.bounces + 0.5));
            var sinstep = (sq * (this.bounces + 0.5)) - step;
            return Math.sin(sinstep * Math.PI) / Math.exp(this.bounces - step);
        };
        return BounceEase;
    }(Anim.EasingFunction));
    Anim.BounceEase = BounceEase;
})(Anim || (Anim = {}));
Anim.EasingFunction.register('bounce', Anim.BounceEase);
var Anim;
(function (Anim) {
    var ElasticEase = (function (_super) {
        __extends(ElasticEase, _super);
        function ElasticEase(init) {
            var _this = _super.call(this) || this;
            _this.oscillations = 3;
            _this.springiness = 3.0;
            if (init)
                _this.assign(init);
            return _this;
        }
        ElasticEase.prototype.easeInCore = function (normalizedTime) {
            return Math.sin(normalizedTime * (this.oscillations * 2 + 0.5) * Math.PI) * Math.pow(normalizedTime, this.springiness);
        };
        return ElasticEase;
    }(Anim.EasingFunction));
    Anim.ElasticEase = ElasticEase;
})(Anim || (Anim = {}));
Anim.EasingFunction.register('elastic', Anim.ElasticEase);
var Anim;
(function (Anim) {
    var TimeManager = (function (_super) {
        __extends(TimeManager, _super);
        function TimeManager() {
            var _this = _super.call(this) || this;
            _this.clocks = undefined;
            _this.timer = undefined;
            _this.start = 0;
            _this.clocks = [];
            _this.start = new Date().getTime();
            _this.addEvents('tick');
            return _this;
        }
        TimeManager.prototype.add = function (clock) {
            var found = false;
            for (var i = 0; !found && (i < this.clocks.length); i++) {
                found = this.clocks[i] === clock;
            }
            if (!found) {
                this.clocks.push(clock);
                if (this.clocks.length === 1) {
                    this.timer = new Core.Timer({ interval: 1 / 60 });
                    this.connect(this.timer, 'timeupdate', this.onTick);
                }
            }
        };
        TimeManager.prototype.remove = function (clock) {
            var i = 0;
            while ((i < this.clocks.length) && (this.clocks[i] != clock)) {
                i++;
            }
            if (i < this.clocks.length)
                this.clocks.splice(i, 1);
            if (this.clocks.length === 0) {
                this.timer.abort();
                this.timer = undefined;
            }
        };
        TimeManager.prototype.onTick = function () {
            var current = (new Date().getTime()) - this.start;
            current /= 1000;
            for (var i = 0; i < this.clocks.length; i++)
                this.clocks[i].update(current);
            this.fireEvent('tick');
        };
        TimeManager.initialize = function () {
            this.current = new Anim.TimeManager();
        };
        TimeManager.current = null;
        return TimeManager;
    }(Core.Object));
    Anim.TimeManager = TimeManager;
})(Anim || (Anim = {}));
Anim.TimeManager.initialize();
var Anim;
(function (Anim) {
    var AnimationManager = (function (_super) {
        __extends(AnimationManager, _super);
        function AnimationManager() {
            var _this = _super.call(this) || this;
            _this.clocks = undefined;
            _this.start = 0;
            _this.onTickBind = undefined;
            _this.addEvents('tick');
            _this.clocks = [];
            _this.start = new Date().getTime();
            _this.onTickBind = _this.onTick.bind(_this);
            return _this;
        }
        AnimationManager.prototype.add = function (clock) {
            var found = false;
            for (var i = 0; !found && (i < this.clocks.length); i++) {
                found = this.clocks[i] === clock;
            }
            if (!found) {
                this.clocks.push(clock);
                if (this.clocks.length == 1)
                    requestAnimationFrame(this.onTickBind);
            }
        };
        AnimationManager.prototype.remove = function (clock) {
            var i = 0;
            while ((i < this.clocks.length) && (this.clocks[i] != clock)) {
                i++;
            }
            if (i < this.clocks.length)
                this.clocks.splice(i, 1);
        };
        AnimationManager.prototype.forceTick = function () {
            if (this.clocks.length > 0)
                this.onTickBind();
        };
        AnimationManager.prototype.onTick = function () {
            var startTime = (new Date().getTime()) / 1000;
            var current = (new Date().getTime()) - this.start;
            current /= 1000;
            for (var i = 0; i < this.clocks.length; i++)
                this.clocks[i].update(current);
            this.fireEvent('tick');
            if (this.clocks.length > 0)
                requestAnimationFrame(this.onTickBind);
        };
        AnimationManager.initialize = function () {
            this.current = new Anim.AnimationManager();
        };
        AnimationManager.current = null;
        return AnimationManager;
    }(Core.Object));
    Anim.AnimationManager = AnimationManager;
})(Anim || (Anim = {}));
Anim.AnimationManager.initialize();
if (!('requestAnimationFrame' in window)) {
    if ('webkitRequestAnimationFrame' in window)
        window.requestAnimationFrame = window['webkitRequestAnimationFrame'];
    else if ('mozRequestAnimationFrame' in window)
        window.requestAnimationFrame = window['mozRequestAnimationFrame'];
    else if ('msRequestAnimationFrame' in window)
        window.requestAnimationFrame = window['msRequestAnimationFrame'];
    else
        window.requestAnimationFrame = function (cb) { setTimeout(cb, 1 / 60); };
}
var Anim;
(function (Anim) {
    var Clock = (function (_super) {
        __extends(Clock, _super);
        function Clock(init) {
            var _this = _super.call(this) || this;
            _this._animation = true;
            _this._parent = undefined;
            _this._time = undefined;
            _this._iteration = undefined;
            _this._progress = undefined;
            _this._isActive = false;
            _this._globalTime = 0;
            _this.startTime = 0;
            _this.lastTick = 0;
            _this._beginTime = 0;
            _this.isPaused = false;
            _this._speed = 1;
            _this._duration = 'forever';
            _this.pendingState = 'none';
            _this._autoReverse = false;
            _this._repeat = 1;
            _this._target = undefined;
            _this._ease = undefined;
            _this.addEvents('complete', 'timeupdate');
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Clock.prototype, "animation", {
            set: function (animation) {
                this._animation = animation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "repeat", {
            set: function (repeat) {
                this._repeat = repeat;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "speed", {
            set: function (speed) {
                this._speed = speed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "autoReverse", {
            set: function (autoReverse) {
                this._autoReverse = autoReverse;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "beginTime", {
            set: function (beginTime) {
                this._beginTime = beginTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "ease", {
            set: function (ease) {
                this._ease = Anim.EasingFunction.create(ease);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "target", {
            set: function (target) {
                this._target = target;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "duration", {
            set: function (duration) {
                if (duration == 'automatic')
                    this._duration = 'forever';
                else
                    this._duration = duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (parent) {
                this._parent = parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "globalTime", {
            get: function () {
                return this._globalTime + (this.lastTick - this.startTime) * this._speed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "isActive", {
            get: function () {
                return this._isActive || (this.pendingState === 'active');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "time", {
            get: function () {
                return this._time;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "iteration", {
            get: function () {
                return this._iteration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "progress", {
            get: function () {
                return this._progress;
            },
            enumerable: true,
            configurable: true
        });
        Clock.prototype.begin = function () {
            if (this.isActive)
                return;
            if (this._parent === undefined) {
                if (this._animation)
                    Anim.AnimationManager.current.add(this);
                else
                    Anim.TimeManager.current.add(this);
            }
            this.pendingState = 'active';
            if ((this._target !== undefined) && (this._target.setAnimClock !== undefined))
                this._target.setAnimClock(this);
        };
        Clock.prototype.pause = function () {
            this.pendingState = 'paused';
        };
        Clock.prototype.resume = function () {
            this.pendingState = 'resumed';
        };
        Clock.prototype.stop = function () {
            this.pendingState = 'stopped';
        };
        Clock.prototype.complete = function () {
            if (this._parent === undefined) {
                if (this._animation)
                    Anim.AnimationManager.current.remove(this);
                else
                    Anim.TimeManager.current.remove(this);
            }
            this.fireEvent('complete');
        };
        Clock.prototype.onTimeUpdate = function (deltaTick) {
            var progress = this.progress;
            if (this._ease !== undefined)
                progress = this._ease.ease(progress);
            this.fireEvent('timeupdate', this, progress, deltaTick);
        };
        Clock.prototype.update = function (parentGlobalTime) {
            do {
                var state = this.pendingState;
                this.pendingState = 'none';
                if (state === 'none') {
                    if (this._isActive && !this.isPaused) {
                        var deltaTick = parentGlobalTime - this.lastTick;
                        this.lastTick = parentGlobalTime;
                        var globalTime = this.globalTime;
                        globalTime -= this._beginTime;
                        if (globalTime >= 0) {
                            if ((this._duration !== 'forever') && (this._duration !== 'automatic')) {
                                var iteration = globalTime / this._duration;
                                var iterationRounded = Math.floor(iteration + 1);
                                var time = globalTime % this._duration;
                                if (this._autoReverse) {
                                    if ((iterationRounded & 1) === 0)
                                        time = this._duration - time;
                                    iteration /= 2;
                                    iterationRounded = Math.floor(iteration + 1);
                                }
                                if (this._repeat == 'forever') {
                                    this._iteration = iterationRounded;
                                    this._time = time;
                                    this._progress = time / this._duration;
                                    this.onTimeUpdate(deltaTick);
                                }
                                else {
                                    if (iteration >= this._repeat) {
                                        this.pendingState = 'stopped';
                                        this._iteration = this._repeat;
                                        this._time = this._duration;
                                        if (this._autoReverse)
                                            this._progress = 0;
                                        else
                                            this._progress = 1;
                                        this.onTimeUpdate(0);
                                    }
                                    else {
                                        this._iteration = iterationRounded;
                                        this._time = time;
                                        this._progress = time / this._duration;
                                        this.onTimeUpdate(deltaTick);
                                    }
                                }
                            }
                            else {
                                this._time = globalTime;
                                this._progress = 0;
                                this._iteration = undefined;
                                this.onTimeUpdate(deltaTick);
                            }
                        }
                    }
                }
                else if (state == 'active') {
                    if (!this._isActive) {
                        this._isActive = true;
                        this._globalTime = 0;
                        this.startTime = parentGlobalTime;
                        this.lastTick = this.startTime;
                        if (this._beginTime > 0) {
                            this._time = undefined;
                            this._progress = undefined;
                            this._iteration = undefined;
                        }
                        else {
                            this._time = 0;
                            this._progress = 0;
                            this._iteration = 1;
                            this.onTimeUpdate(0);
                        }
                    }
                }
                else if (state == 'paused') {
                    if (!this.isPaused && this._isActive) {
                        this.isPaused = true;
                        this._globalTime = this.globalTime;
                        this.startTime = 0;
                        this.lastTick = 0;
                    }
                }
                else if (state == 'resumed') {
                    if (this.isPaused && this._isActive) {
                        this.isPaused = false;
                        this.startTime = parentGlobalTime;
                        this.lastTick = parentGlobalTime;
                    }
                }
                else if (state == 'stopped') {
                    if (this._isActive) {
                        this._progress = undefined;
                        this._time = undefined;
                        this._iteration = undefined;
                        this._isActive = false;
                    }
                }
            } while (this.pendingState != 'none');
            if ((this._parent === undefined) && !this._isActive)
                this.complete();
        };
        return Clock;
    }(Core.Object));
    Anim.Clock = Clock;
})(Anim || (Anim = {}));
var Anim;
(function (Anim) {
    var ClockGroup = (function (_super) {
        __extends(ClockGroup, _super);
        function ClockGroup() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.children = [];
            return _this;
        }
        ClockGroup.prototype.appendChild = function (child) {
            child.parent = this;
            this.children.push(child);
        };
        Object.defineProperty(ClockGroup.prototype, "content", {
            set: function (content) {
                this.children = [];
                if (content !== undefined) {
                    if (content instanceof Array) {
                        for (var i = 0; i < content.length; i++)
                            this.appendChild(content[i]);
                    }
                    else
                        this.appendChild(content);
                }
            },
            enumerable: true,
            configurable: true
        });
        ClockGroup.prototype.begin = function () {
            _super.prototype.begin.call(this);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].begin();
        };
        ClockGroup.prototype.pause = function () {
            _super.prototype.pause.call(this);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].pause();
        };
        ClockGroup.prototype.resume = function () {
            _super.prototype.resume.call(this);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].resume();
        };
        ClockGroup.prototype.stop = function () {
            _super.prototype.stop.call(this);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].stop();
        };
        ClockGroup.prototype.complete = function () {
            _super.prototype.complete.call(this);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].complete();
        };
        ClockGroup.prototype.update = function (parentGlobalTime) {
            do {
                _super.prototype.update.call(this, parentGlobalTime);
                var childStopped = true;
                for (var i = 0; i < this.children.length; i++) {
                    var childClock = this.children[i];
                    childClock.update(this.globalTime);
                    if (childClock.isActive)
                        childStopped = false;
                }
                if (this.isActive && childStopped)
                    this.pendingState = 'stopped';
            } while (this.pendingState != 'none');
        };
        return ClockGroup;
    }(Anim.Clock));
    Anim.ClockGroup = ClockGroup;
})(Anim || (Anim = {}));
var Ui;
(function (Ui) {
    var Matrix = (function (_super) {
        __extends(Matrix, _super);
        function Matrix() {
            var _this = _super.call(this) || this;
            _this.a = 1;
            _this.b = 0;
            _this.c = 0;
            _this.d = 1;
            _this.e = 0;
            _this.f = 0;
            return _this;
        }
        Matrix.prototype.isTranslateOnly = function () {
            return ((this.a === 1) && (this.b === 0) && (this.c === 0) && (this.d === 1));
        };
        Matrix.prototype.isIdentity = function () {
            return ((this.a === 1) && (this.b === 0) && (this.c === 0) && (this.d === 1) && (this.e === 0) && (this.f === 0));
        };
        Matrix.prototype.translate = function (x, y) {
            return this.multiply(Matrix.createTranslate(x, y));
        };
        Matrix.prototype.rotate = function (angle) {
            return this.multiply(Matrix.createRotate(angle));
        };
        Matrix.prototype.scale = function (scaleX, scaleY) {
            if (scaleY === undefined)
                scaleY = scaleX;
            return this.multiply(Matrix.createScale(scaleX, scaleY));
        };
        Matrix.prototype.multiply = function (matrix) {
            var a = matrix.a * this.a + matrix.b * this.c;
            var c = matrix.c * this.a + matrix.d * this.c;
            var e = matrix.e * this.a + matrix.f * this.c + this.e;
            var b = matrix.a * this.b + matrix.b * this.d;
            var d = matrix.c * this.b + matrix.d * this.d;
            var f = matrix.e * this.b + matrix.f * this.d + this.f;
            return Matrix.createMatrix(a, b, c, d, e, f);
        };
        Matrix.prototype.getDeterminant = function () {
            return ((this.a * this.d) - (this.b * this.c));
        };
        Matrix.prototype.inverse = function () {
            var determinant = this.getDeterminant();
            if (determinant === 0)
                throw ("Matrix not invertible");
            var invd = 1 / determinant;
            var ta = this.d * invd;
            var tb = -this.b * invd;
            var tc = -this.c * invd;
            var td = this.a * invd;
            var te = ((this.c * this.f) - (this.e * this.d)) * invd;
            var tf = ((this.e * this.b) - (this.a * this.f)) * invd;
            return Matrix.createMatrix(ta, tb, tc, td, te, tf);
        };
        Matrix.prototype.setMatrix = function (a, b, c, d, e, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        };
        Matrix.prototype.getA = function () {
            return this.a;
        };
        Matrix.prototype.getB = function () {
            return this.b;
        };
        Matrix.prototype.getC = function () {
            return this.c;
        };
        Matrix.prototype.getD = function () {
            return this.d;
        };
        Matrix.prototype.getE = function () {
            return this.e;
        };
        Matrix.prototype.getF = function () {
            return this.f;
        };
        Matrix.prototype.clone = function () {
            return Matrix.createMatrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        Matrix.prototype.toString = function () {
            return 'matrix(' + this.a.toFixed(4) + ',' + this.b.toFixed(4) + ',' + this.c.toFixed(4) + ',' + this.d.toFixed(4) + ',' + this.e.toFixed(4) + ',' + this.f.toFixed(4) + ')';
        };
        Matrix.createMatrix = function (a, b, c, d, e, f) {
            var matrix = new Matrix();
            matrix.setMatrix(a, b, c, d, e, f);
            return matrix;
        };
        Matrix.createTranslate = function (x, y) {
            return Matrix.createMatrix(1, 0, 0, 1, x, y);
        };
        Matrix.createScaleAt = function (scaleX, scaleY, centerX, centerY) {
            return Matrix.createMatrix(scaleX, 0, 0, scaleY, centerX - (scaleX * centerX), centerY - (scaleY * centerY));
        };
        Matrix.createScale = function (scaleX, scaleY) {
            if (scaleY === undefined)
                scaleY = scaleX;
            return Matrix.createScaleAt(scaleX, scaleY, 0, 0);
        };
        Matrix.createRotateAt = function (angle, centerX, centerY) {
            angle = (angle % 360) * Math.PI / 180;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var offsetX = (centerX * (1.0 - cos)) + (centerY * sin);
            var offsetY = (centerY * (1.0 - cos)) - (centerX * sin);
            return Matrix.createMatrix(cos, sin, -sin, cos, offsetX, offsetY);
        };
        Matrix.createRotate = function (angle) {
            return Matrix.createRotateAt(angle, 0, 0);
        };
        Matrix.parse = function (stringMatrix) {
            var matrix;
            if (typeof (stringMatrix) === 'string') {
                var res = void 0;
                if ((res = stringMatrix.match(/^matrix\((-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)\)$/)) != undefined) {
                    var a = parseFloat(res[1]);
                    var b = parseFloat(res[2]);
                    var c = parseFloat(res[3]);
                    var d = parseFloat(res[4]);
                    var e = parseFloat(res[5]);
                    var f = parseFloat(res[6]);
                    matrix = new Matrix();
                    matrix.setMatrix(a, b, c, d, e, f);
                }
            }
            if (matrix === undefined)
                throw ('Unknown matrix format (' + stringMatrix + ')');
            return matrix;
        };
        return Matrix;
    }(Core.Object));
    Ui.Matrix = Matrix;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var _this = _super.call(this) || this;
            _this.x = 0;
            _this.y = 0;
            _this.x = x;
            _this.y = y;
            return _this;
        }
        Point.prototype.matrixTransform = function (matrix) {
            var x = this.x * matrix.a + this.y * matrix.c + matrix.e;
            var y = this.x * matrix.b + this.y * matrix.d + matrix.f;
            this.x = x;
            this.y = y;
            return this;
        };
        Point.prototype.multiply = function (value) {
            var res;
            if (typeof (value) === 'number')
                res = new Ui.Point(this.x * value, this.y * value);
            else if (value instanceof Ui.Matrix)
                res = new Ui.Point(this.x * value.a + this.y * value.c + value.e, this.x * value.b + this.y * value.d + value.f);
            else
                res = this;
            return res;
        };
        Point.prototype.divide = function (value) {
            var res;
            if (typeof (value) === 'number')
                res = new Ui.Point(this.x / value, this.y / value);
            else if (value instanceof Ui.Matrix) {
                value = value.inverse();
                res = new Ui.Point(this.x * value.a + this.y * value.c + value.e, this.x * value.b + this.y * value.d + value.f);
            }
            else
                res = this;
            return res;
        };
        Point.prototype.add = function (value) {
            var res;
            if (typeof (value) === 'number')
                res = new Point(this.x + value, this.y + value);
            else if (value instanceof Point)
                res = new Point(this.x + value.x, this.y + value.y);
            else
                res = this;
            return res;
        };
        Point.prototype.substract = function (value) {
            var res;
            if (typeof (value) === 'number')
                res = new Point(this.x - value, this.y - value);
            else if (value instanceof Point)
                res = new Point(this.x - value.x, this.y - value.y);
            else
                res = this;
            return res;
        };
        Point.prototype.setPoint = function (point) {
            this.x = point.x;
            this.y = point.y;
        };
        Point.prototype.getX = function () {
            return this.x;
        };
        Point.prototype.setX = function (x) {
            this.x = x;
        };
        Point.prototype.getY = function () {
            return this.y;
        };
        Point.prototype.setY = function (y) {
            this.y = y;
        };
        Point.prototype.getLength = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        Point.prototype.toString = function () {
            return 'point(' + this.x.toFixed(4) + ', ' + this.y.toFixed(4) + ')';
        };
        return Point;
    }(Core.Object));
    Ui.Point = Point;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Color = (function (_super) {
        __extends(Color, _super);
        function Color(r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 1; }
            var _this = _super.call(this) || this;
            _this.r = 0;
            _this.g = 0;
            _this.b = 0;
            _this.a = 1;
            _this.r = r;
            _this.g = g;
            _this.b = b;
            _this.a = a;
            return _this;
        }
        Color.prototype.addA = function (a) {
            return new Color(this.r, this.g, this.b, Math.max(0, Math.min(1, this.a + a)));
        };
        Color.prototype.addY = function (y) {
            var yuva = this.getYuva();
            yuva.y += y;
            return Color.createFromYuv(yuva.y, yuva.u, yuva.v, yuva.a);
        };
        Color.prototype.addH = function (h) {
            var hsla = this.getHsla();
            hsla.h += h;
            return Color.createFromHsl(hsla.h, hsla.s, hsla.l, hsla.a);
        };
        Color.prototype.addS = function (s) {
            var hsla = this.getHsla();
            hsla.s += s;
            return Color.createFromHsl(hsla.h, hsla.s, hsla.l, hsla.a);
        };
        Color.prototype.addL = function (l) {
            var hsla = this.getHsla();
            hsla.l += l;
            return Color.createFromHsl(hsla.h, hsla.s, hsla.l, hsla.a);
        };
        Color.prototype.getCssRgba = function () {
            return 'rgba(' + Math.round(this.r * 255) + ',' + Math.round(this.g * 255) + ',' + Math.round(this.b * 255) + ',' + this.a + ')';
        };
        Color.prototype.getCssRgb = function () {
            return 'rgb(' + Math.round(this.r * 255) + ',' + Math.round(this.g * 255) + ',' + Math.round(this.b * 255) + ')';
        };
        Color.prototype.getCssHtml = function () {
            var res = '#';
            var t = Math.round(this.r * 255).toString(16);
            if (t.length == 1)
                t = '0' + t;
            res += t;
            t = Math.round(this.g * 255).toString(16);
            if (t.length == 1)
                t = '0' + t;
            res += t;
            t = Math.round(this.b * 255).toString(16);
            if (t.length == 1)
                t = '0' + t;
            res += t;
            return res;
        };
        Color.prototype.getRgba = function () {
            return { r: this.r, g: this.g, b: this.b, a: this.a };
        };
        Color.prototype.getRgb = function () {
            return this.getRgba();
        };
        Color.prototype.getHsla = function () {
            var r = this.r;
            var g = this.g;
            var b = this.b;
            var min = Math.min(r, Math.min(g, b));
            var max = Math.max(r, Math.max(g, b));
            var h;
            var s;
            var l = max;
            var delta = max - min;
            if (delta === 0)
                return { h: 0, s: 0, l: l, a: this.a };
            if (max !== 0)
                s = delta / max;
            else
                return { h: 0, s: 0, l: l, a: this.a };
            if (r === max)
                h = (g - b) / delta;
            else if (g === max)
                h = 2 + (b - r) / delta;
            else
                h = 4 + (r - g) / delta;
            h *= 60;
            if (h < 0)
                h += 360;
            return { h: h, s: s, l: l, a: this.a };
        };
        Color.prototype.getHsl = function () {
            return this.getHsla();
        };
        Color.prototype.getYuva = function () {
            var y = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
            var u = 0.492 * (this.b - y);
            var v = 0.877 * (this.r - y);
            return { y: y, u: u, v: v, a: this.a };
        };
        Color.prototype.getYuv = function () {
            return this.getYuva();
        };
        Color.prototype.initFromHsl = function (h, s, l, a) {
            if (a === void 0) { a = 1; }
            if (s <= 0) {
                this.r = l;
                this.g = l;
                this.b = l;
                return;
            }
            h /= 60;
            var i = Math.floor(h);
            var f = h - i;
            var p = l * (1 - s);
            var q = l * (1 - s * f);
            var t = l * (1 - s * (1 - f));
            if (i === 0) {
                this.r = l;
                this.g = t;
                this.b = p;
            }
            else if (i == 1) {
                this.r = q;
                this.g = l;
                this.b = p;
            }
            else if (i == 2) {
                this.r = p;
                this.g = l;
                this.b = t;
            }
            else if (i == 3) {
                this.r = p;
                this.g = q;
                this.b = l;
            }
            else if (i == 4) {
                this.r = t;
                this.g = p;
                this.b = l;
            }
            else {
                this.r = l;
                this.g = p;
                this.b = q;
            }
            if (isNaN(this.r))
                this.r = 0;
            if (isNaN(this.g))
                this.g = 0;
            if (isNaN(this.b))
                this.b = 0;
            this.a = Math.min(Math.max(a, 0), 1);
        };
        Color.prototype.initFromYuv = function (y, u, v, a) {
            if (a === void 0) { a = 1; }
            this.r = Math.max(0, Math.min(y + 1.13983 * v, 1));
            this.g = Math.max(0, Math.min(y - 0.39465 * u - 0.58060 * v, 1));
            this.b = Math.max(0, Math.min(y + 2.03211 * u, 1));
            this.a = Math.min(Math.max(a, 0), 1);
        };
        Color.prototype.initFromRgb = function (r, g, b, a) {
            if (a === void 0) { a = 1; }
            this.r = Math.min(Math.max(this.r, 0), 1);
            this.g = Math.min(Math.max(this.g, 0), 1);
            this.b = Math.min(Math.max(this.b, 0), 1);
            this.a = Math.min(Math.max(this.a, 0), 1);
        };
        Color.prototype.toString = function () {
            return 'color(' + this.r.toFixed(4) + ', ' + this.g.toFixed(4) + ', ' + this.b.toFixed(4) + ', ' + this.a.toFixed(4) + ')';
        };
        Color.parse = function (color) {
            var r;
            var g;
            var b;
            var a;
            if (typeof (color) == 'string') {
                if (color in Color.knownColor)
                    color = Color.knownColor[color];
                var res = void 0;
                if ((res = color.match(/^\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+\.?\d*)\s*\)\s*$/)) != undefined) {
                    r = parseInt(res[1]) / 255;
                    g = parseInt(res[2]) / 255;
                    b = parseInt(res[3]) / 255;
                    a = parseFloat(res[4]);
                    return new Color(r, g, b, a);
                }
                else if ((res = color.match(/^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/)) != undefined) {
                    r = parseInt(res[1]) / 255;
                    g = parseInt(res[2]) / 255;
                    b = parseInt(res[3]) / 255;
                    return new Color(r, g, b);
                }
                else if (color.indexOf('#') === 0) {
                    if (color.length == 7) {
                        r = parseInt(color.substr(1, 2), 16) / 255;
                        g = parseInt(color.substr(3, 2), 16) / 255;
                        b = parseInt(color.substr(5, 2), 16) / 255;
                        return new Color(r, g, b);
                    }
                    else if (color.length == 4) {
                        r = parseInt(color.substr(1, 1), 16) / 15;
                        g = parseInt(color.substr(2, 1), 16) / 15;
                        b = parseInt(color.substr(3, 1), 16) / 15;
                        return new Color(r, g, b);
                    }
                }
            }
            throw ('Unknown color format (' + color + ')');
        };
        Color.create = function (color) {
            if (color instanceof Color)
                return color;
            else
                return Color.parse(color);
        };
        Color.createFromRgb = function (r, g, b, a) {
            if (a === void 0) { a = 1; }
            var color = new Color();
            color.initFromRgb(r, g, b, a);
            return color;
        };
        Color.createFromYuv = function (y, u, v, a) {
            if (a === void 0) { a = 1; }
            var color = new Color();
            color.initFromYuv(y, u, v, a);
            return color;
        };
        Color.createFromHsl = function (h, s, l, a) {
            if (a === void 0) { a = 1; }
            var color = new Color();
            color.initFromHsl(h, s, l, a);
            return color;
        };
        Color.knownColor = {
            white: '#ffffff',
            black: '#000000',
            red: '#ff0000',
            green: '#008000',
            blue: '#0000ff',
            lightblue: '#add8e6',
            lightgreen: '#90ee90',
            orange: '#ffa500',
            purple: '#800080',
            lightgray: '#d3d3d3',
            darkgray: '#a9a9a9',
            pink: '#ffc0cb',
            brown: '#a52a2a'
        };
        return Color;
    }(Core.Object));
    Ui.Color = Color;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var LinearGradient = (function (_super) {
        __extends(LinearGradient, _super);
        function LinearGradient(stops, orientation) {
            if (orientation === void 0) { orientation = 'vertical'; }
            var _this = _super.call(this) || this;
            _this.image = undefined;
            if (stops !== undefined)
                _this.stops = stops;
            else
                _this.stops = [
                    { offset: 0, color: new Ui.Color(1, 1, 1, 1) },
                    { offset: 1, color: new Ui.Color(0, 0, 0, 1) }
                ];
            _this.orientation = orientation;
            for (var i = 0; i < _this.stops.length; i++)
                _this.stops[i].color = Ui.Color.create(_this.stops[i].color);
            return _this;
        }
        LinearGradient.prototype.getBackgroundImage = function () {
            var i;
            var stop;
            var gradient;
            if (this.image !== undefined)
                return this.image;
            if (Core.Navigator.isWebkit) {
                this.image = '-webkit-gradient(linear, 0% 0%, ';
                if (this.orientation == 'vertical')
                    this.image += '0% 100%';
                else
                    this.image += '100% 0%';
                for (i = 0; i < this.stops.length; i++) {
                    stop = this.stops[i];
                    this.image += ', color-stop(' + stop.offset + ', ' + stop.color.getCssRgba() + ')';
                }
                this.image += ')';
            }
            else if (Core.Navigator.isGecko) {
                this.image = '-moz-linear-gradient(';
                if (this.orientation == 'vertical')
                    this.image += '-90deg';
                else
                    this.image += '0deg';
                for (i = 0; i < this.stops.length; i++) {
                    stop = this.stops[i];
                    this.image += ', ' + stop.color.getCssRgba() + ' ' + Math.round(stop.offset * 100) + '%';
                }
                this.image += ')';
            }
            else if (Core.Navigator.supportCanvas) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                if (this.orientation == 'vertical') {
                    canvas.setAttribute('width', 1, null);
                    canvas.setAttribute('height', 100, null);
                    gradient = context.createLinearGradient(0, 0, 0, 100);
                    for (i = 0; i < this.stops.length; i++) {
                        stop = this.stops[i];
                        gradient.addColorStop(stop.offset, stop.color.getCssRgba());
                    }
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, 1, 100);
                }
                else {
                    canvas.setAttribute('width', 100, null);
                    canvas.setAttribute('height', 1, null);
                    gradient = context.createLinearGradient(0, 0, 100, 0);
                    for (i = 0; i < this.stops.length; i++) {
                        stop = this.stops[i];
                        gradient.addColorStop(stop.offset, stop.color.getCssRgba());
                    }
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, 100, 1);
                }
                this.image = 'url(' + canvas.toDataURL() + ')';
            }
            else {
                this.image = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAAAZiS0dEAO8AUQBRItXOlAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9gJDxcIBl8Z3A0AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAC0lEQVQI12NgwAUAABoAASRETuUAAAAASUVORK5CYII%3D)';
            }
            return this.image;
        };
        LinearGradient.prototype.getSVGGradient = function () {
            var gradient = document.createElementNS(svgNS, 'linearGradient');
            gradient.setAttributeNS(null, 'gradientUnits', 'objectBoundingBox');
            gradient.setAttributeNS(null, 'x1', 0);
            gradient.setAttributeNS(null, 'y1', 0);
            if (this.orientation == 'vertical') {
                gradient.setAttributeNS(null, 'x2', 0);
                gradient.setAttributeNS(null, 'y2', 1);
            }
            else {
                gradient.setAttributeNS(null, 'x2', 1);
                gradient.setAttributeNS(null, 'y2', 0);
            }
            for (var i = 0; i < this.stops.length; i++) {
                var stop_1 = this.stops[i];
                var svgStop = document.createElementNS(svgNS, 'stop');
                svgStop.setAttributeNS(null, 'offset', stop_1.offset);
                svgStop.style.stopColor = stop_1.color.getCssHtml();
                svgStop.style.stopOpacity = stop_1.color.getRgba().a;
                gradient.appendChild(svgStop);
            }
            return gradient;
        };
        LinearGradient.prototype.getCanvasGradient = function (context, width, height) {
            var gradient;
            if (this.orientation == 'vertical')
                gradient = context.createLinearGradient(0, 0, 0, height);
            else
                gradient = context.createLinearGradient(0, 0, width, 0);
            for (var i = 0; i < this.stops.length; i++) {
                var stop_2 = this.stops[i];
                gradient.addColorStop(stop_2.offset, stop_2.color.getCssRgba());
            }
            return gradient;
        };
        return LinearGradient;
    }(Core.Object));
    Ui.LinearGradient = LinearGradient;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Element = (function (_super) {
        __extends(Element, _super);
        function Element(init) {
            var _this = _super.call(this) || this;
            _this.name = undefined;
            _this._marginTop = 0;
            _this._marginBottom = 0;
            _this._marginLeft = 0;
            _this._marginRight = 0;
            _this._parent = undefined;
            _this._width = undefined;
            _this._height = undefined;
            _this._maxWidth = undefined;
            _this._maxHeight = undefined;
            _this._drawing = undefined;
            _this.collapse = false;
            _this.measureValid = false;
            _this.measureConstraintPixelRatio = 1;
            _this.measureConstraintWidth = 0;
            _this.measureConstraintHeight = 0;
            _this._measureWidth = 0;
            _this._measureHeight = 0;
            _this.arrangeValid = false;
            _this.arrangeX = 0;
            _this.arrangeY = 0;
            _this.arrangeWidth = 0;
            _this.arrangeHeight = 0;
            _this.arrangePixelRatio = 1;
            _this.drawValid = true;
            _this.drawNext = undefined;
            _this.layoutValid = true;
            _this.layoutNext = undefined;
            _this._layoutX = 0;
            _this._layoutY = 0;
            _this._layoutWidth = 0;
            _this._layoutHeight = 0;
            _this._isLoaded = false;
            _this._verticalAlign = 'stretch';
            _this._horizontalAlign = 'stretch';
            _this._clipToBounds = false;
            _this.clipX = undefined;
            _this.clipY = undefined;
            _this.clipWidth = undefined;
            _this.clipHeight = undefined;
            _this.visible = undefined;
            _this._parentVisible = undefined;
            _this._eventsHidden = false;
            _this._focusable = false;
            _this._hasFocus = false;
            _this.isMouseFocus = false;
            _this.isMouseDownFocus = false;
            _this._selectable = false;
            _this._transform = undefined;
            _this.transformOriginX = 0.5;
            _this.transformOriginY = 0.5;
            _this.transformOriginAbsolute = false;
            _this.animClock = undefined;
            _this._opacity = 1;
            _this.parentOpacity = 1;
            _this.disabled = undefined;
            _this.parentDisabled = undefined;
            _this.style = undefined;
            _this.parentStyle = undefined;
            _this.mergeStyle = undefined;
            _this._drawing = _this.renderDrawing();
            if (DEBUG) {
                _this._drawing.setAttribute('class', _this.getClassName());
                _this._drawing.data = _this;
            }
            _this._drawing.style.position = 'absolute';
            _this._drawing.style.left = '0px';
            _this._drawing.style.top = '0px';
            _this._drawing.style.width = '0px';
            _this._drawing.style.height = '0px';
            _this._drawing.style.visibility = 'hidden';
            _this._drawing.style.outline = 'none';
            _this._drawing.style.transformOrigin = '0 0';
            if (Core.Navigator.isIE)
                _this._drawing.style.msTransformOrigin = '0 0';
            else if (Core.Navigator.isGecko)
                _this._drawing.style.MozTransformOrigin = '0 0';
            else if (Core.Navigator.isWebkit)
                _this._drawing.style.webkitTransformOrigin = '0 0';
            else if (Core.Navigator.isOpera)
                _this._drawing.style.OTransformOrigin = '0 0';
            _this.connect(_this._drawing, 'focus', _this.onFocus);
            _this.connect(_this._drawing, 'blur', _this.onBlur);
            _this.selectable = false;
            _this.addEvents('focus', 'blur', 'load', 'unload', 'enable', 'disable', 'visible', 'hidden', 'ptrdown', 'ptrmove', 'ptrup', 'ptrcancel', 'wheel', 'dragover');
            if (init)
                _this.assign(init);
            return _this;
        }
        Element.prototype.setDisabled = function (disabled) {
            if (disabled)
                this.disable();
            else
                this.enable();
        };
        Object.defineProperty(Element.prototype, "drawing", {
            get: function () {
                return this._drawing;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "selectable", {
            get: function () {
                return this._selectable;
            },
            set: function (selectable) {
                this._selectable = selectable;
                this.drawing.selectable = selectable;
                Element.setSelectable(this.drawing, selectable);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "layoutX", {
            get: function () {
                return this._layoutX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "layoutY", {
            get: function () {
                return this._layoutY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "layoutWidth", {
            get: function () {
                return this._layoutWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "layoutHeight", {
            get: function () {
                return this._layoutHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "id", {
            get: function () {
                return this._drawing.getAttribute('id');
            },
            set: function (id) {
                this._drawing.setAttribute('id', id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "focusable", {
            get: function () {
                return this._focusable;
            },
            set: function (focusable) {
                if (this._focusable !== focusable) {
                    this._focusable = focusable;
                    if (focusable && !this.isDisabled) {
                        this._drawing.tabIndex = 0;
                        this.connect(this.drawing, 'mousedown', this.onMouseDownFocus, true);
                    }
                    else {
                        this.disconnect(this.drawing, 'mousedown', this.onMouseDownFocus);
                        var node = this._drawing.getAttributeNode('tabIndex');
                        if (node !== undefined)
                            this._drawing.removeAttributeNode(node);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.onMouseDownFocus = function (event) {
            this.isMouseDownFocus = true;
            this.connect(window, 'mouseup', this.onMouseUpFocus, true);
        };
        Element.prototype.onMouseUpFocus = function (event) {
            this.isMouseDownFocus = false;
            this.disconnect(window, 'mouseup', this.onMouseUpFocus);
        };
        Element.prototype.getIsMouseFocus = function () {
            return this.isMouseFocus;
        };
        Object.defineProperty(Element.prototype, "role", {
            set: function (role) {
                if ('setAttributeNS' in this._drawing) {
                    if (role === undefined) {
                        if (this._drawing.hasAttributeNS('http://www.w3.org/2005/07/aaa', 'role'))
                            this._drawing.removeAttributeNS('http://www.w3.org/2005/07/aaa', 'role');
                    }
                    else
                        this._drawing.setAttributeNS('http://www.w3.org/2005/07/aaa', 'role', role);
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.measure = function (width, height) {
            if (!this._isLoaded)
                return { width: 0, height: 0 };
            if (this.collapse) {
                this.measureValid = true;
                return { width: 0, height: 0 };
            }
            if (this.measureValid && (this.measureConstraintWidth === width) && (this.measureConstraintHeight === height) &&
                (this.measureConstraintPixelRatio == (window.devicePixelRatio || 1)))
                return { width: this._measureWidth, height: this._measureHeight };
            this.measureConstraintPixelRatio = (window.devicePixelRatio || 1);
            this.measureConstraintWidth = width;
            this.measureConstraintHeight = height;
            var marginLeft = this.marginLeft;
            var marginRight = this.marginRight;
            var marginTop = this.marginTop;
            var marginBottom = this.marginBottom;
            var constraintWidth = Math.max(width - (marginLeft + marginRight), 0);
            var constraintHeight = Math.max(height - (marginTop + marginBottom), 0);
            if (this._maxWidth !== undefined)
                constraintWidth = Math.min(constraintWidth, this._maxWidth);
            if (this._maxHeight !== undefined)
                constraintHeight = Math.min(constraintHeight, this._maxHeight);
            if (this._horizontalAlign !== 'stretch')
                constraintWidth = 0;
            if (this._verticalAlign !== 'stretch')
                constraintHeight = 0;
            if (this._width !== undefined)
                constraintWidth = Math.max(this._width, constraintWidth);
            if (this._height !== undefined)
                constraintHeight = Math.max(this._height, constraintHeight);
            var size = this.measureCore(constraintWidth, constraintHeight);
            if ((this._width !== undefined) && (size.width < this._width))
                this._measureWidth = this._width + marginLeft + marginRight;
            else
                this._measureWidth = Math.ceil(size.width) + marginLeft + marginRight;
            if ((this._height !== undefined) && (size.height < this._height))
                this._measureHeight = this._height + marginTop + marginBottom;
            else
                this._measureHeight = Math.ceil(size.height) + marginTop + marginBottom;
            this.measureValid = true;
            return { width: this._measureWidth, height: this._measureHeight };
        };
        Element.prototype.measureCore = function (width, height) {
            return { width: 0, height: 0 };
        };
        Element.prototype.invalidateMeasure = function () {
            if (this.measureValid) {
                this.measureValid = false;
                if ((this._parent != undefined) && (this._parent.measureValid))
                    this._parent.onChildInvalidateMeasure(this, 'change');
            }
            this.invalidateArrange();
        };
        Element.prototype.invalidateLayout = function () {
            if (this.layoutValid) {
                this.layoutValid = false;
                this.measureValid = false;
                this.arrangeValid = false;
                Ui.App.current.enqueueLayout(this);
            }
        };
        Element.prototype.onChildInvalidateMeasure = function (child, event) {
            this.invalidateMeasure();
        };
        Element.prototype.updateLayout = function (width, height) {
            this._layoutWidth = width;
            this._layoutHeight = height;
            this.layoutCore();
            this.layoutValid = true;
        };
        Element.prototype.layoutCore = function () {
            this.measure(this._layoutWidth, this._layoutHeight);
            this.arrange(this._layoutX, this._layoutY, this._layoutWidth, this._layoutHeight);
        };
        Element.prototype.arrange = function (x, y, width, height) {
            if (!this._isLoaded || this.collapse)
                return;
            if (isNaN(x))
                x = 0;
            if (isNaN(y))
                y = 0;
            if (isNaN(width))
                width = 0;
            if (isNaN(height))
                height = 0;
            x = Math.round(x);
            y = Math.round(y);
            width = Math.round(width);
            height = Math.round(height);
            if (!this.arrangeValid || (this.arrangeX != x) || (this.arrangeY != y) ||
                (this.arrangeWidth != width) || (this.arrangeHeight != height) ||
                (this.arrangePixelRatio != (window.devicePixelRatio || 1))) {
                this.arrangeX = x;
                this.arrangeY = y;
                this.arrangeWidth = width;
                this.arrangeHeight = height;
                this.arrangePixelRatio = (window.devicePixelRatio || 1);
                if (this._verticalAlign == 'top') {
                    height = this._measureHeight;
                }
                else if (this._verticalAlign == 'bottom') {
                    y += height - this._measureHeight;
                    height = this._measureHeight;
                }
                else if (this._verticalAlign == 'center') {
                    y += (height - this._measureHeight) / 2;
                    height = this._measureHeight;
                }
                if (this._horizontalAlign == 'left') {
                    width = this._measureWidth;
                }
                else if (this._horizontalAlign == 'right') {
                    x += width - this._measureWidth;
                    width = this._measureWidth;
                }
                else if (this._horizontalAlign == 'center') {
                    x += (width - this._measureWidth) / 2;
                    width = this._measureWidth;
                }
                var marginLeft = this.marginLeft;
                var marginRight = this.marginRight;
                var marginTop = this.marginTop;
                var marginBottom = this.marginBottom;
                x += marginLeft;
                y += marginTop;
                width -= marginLeft + marginRight;
                height -= marginTop + marginBottom;
                this._layoutX = x;
                this._layoutY = y;
                this._layoutWidth = Math.max(width, 0);
                this._layoutHeight = Math.max(height, 0);
                this._drawing.style.left = Math.round(this._layoutX) + 'px';
                this._drawing.style.top = Math.round(this._layoutY) + 'px';
                if (this._transform !== undefined)
                    this.updateTransform();
                if (this._eventsHidden) {
                    this._drawing.style.width = '0px';
                    this._drawing.style.height = '0px';
                }
                else {
                    this._drawing.style.width = Math.round(this._layoutWidth) + 'px';
                    this._drawing.style.height = Math.round(this._layoutHeight) + 'px';
                }
                this._drawing.style.visibility = 'inherit';
                this.arrangeCore(this._layoutWidth, this._layoutHeight);
            }
            this.arrangeValid = true;
        };
        Element.prototype.arrangeCore = function (width, height) {
        };
        Element.prototype.invalidateArrange = function () {
            if (this.arrangeValid) {
                this.arrangeValid = false;
                if (this._parent != undefined)
                    this._parent.onChildInvalidateArrange(this);
            }
        };
        Element.prototype.onChildInvalidateArrange = function (child) {
            this.invalidateArrange();
        };
        Element.prototype.draw = function () {
            this.drawCore();
            this.drawValid = true;
        };
        Element.prototype.drawCore = function () {
        };
        Element.prototype.invalidateDraw = function () {
            if (Ui.App.current === undefined)
                return;
            if (this.drawValid) {
                this.drawValid = false;
                Ui.App.current.enqueueDraw(this);
            }
        };
        Element.prototype.renderDrawing = function () {
            return document.createElement('div');
        };
        Object.defineProperty(Element.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (width) {
                if (this._width !== width) {
                    this._width = width;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (height) {
                if (this._height !== height) {
                    this._height = height;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "maxWidth", {
            get: function () {
                return this._maxWidth;
            },
            set: function (width) {
                if (this._maxWidth !== width) {
                    this._maxWidth = width;
                    if (this._layoutWidth > this._maxWidth)
                        this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "maxHeight", {
            get: function () {
                return this._maxHeight;
            },
            set: function (height) {
                if (this._maxWidth !== height) {
                    this._maxHeight = height;
                    if (this._layoutHeight > this._maxHeight)
                        this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "verticalAlign", {
            get: function () {
                return this._verticalAlign;
            },
            set: function (align) {
                if (this._verticalAlign !== align) {
                    this._verticalAlign = align;
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "horizontalAlign", {
            get: function () {
                return this._horizontalAlign;
            },
            set: function (align) {
                if (this._horizontalAlign !== align) {
                    this._horizontalAlign = align;
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "clipToBounds", {
            get: function () {
                return this._clipToBounds;
            },
            set: function (clip) {
                if (this._clipToBounds !== clip) {
                    this._clipToBounds = clip;
                    if (clip)
                        this._drawing.style.overflow = 'hidden';
                    else
                        this._drawing.style.removeProperty('overflow');
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.setClipRectangle = function (x, y, width, height) {
            this.clipX = x;
            this.clipY = y;
            this.clipWidth = width;
            this.clipHeight = height;
            this.updateClipRectangle();
        };
        Element.prototype.updateClipRectangle = function () {
            if (this.clipX !== undefined) {
                var x = Math.round(this.clipX);
                var y = Math.round(this.clipY);
                var width = Math.round(this.clipWidth);
                var height = Math.round(this.clipHeight);
                this._drawing.style.clip = 'rect(' + y + 'px ' + (x + width) + 'px ' + (y + height) + 'px ' + x + 'px)';
            }
            else {
                if ('removeProperty' in this._drawing.style)
                    this._drawing.style.removeProperty('clip');
                else if ('removeAttribute' in this._drawing.style)
                    this._drawing.style.removeAttribute('clip');
            }
        };
        Object.defineProperty(Element.prototype, "margin", {
            set: function (margin) {
                this.marginTop = margin;
                this.marginBottom = margin;
                this.marginLeft = margin;
                this.marginRight = margin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "marginTop", {
            get: function () {
                return this._marginTop;
            },
            set: function (marginTop) {
                if (marginTop !== this._marginTop) {
                    this._marginTop = marginTop;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "marginBottom", {
            get: function () {
                return this._marginBottom;
            },
            set: function (marginBottom) {
                if (marginBottom !== this._marginBottom) {
                    this._marginBottom = marginBottom;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "marginLeft", {
            get: function () {
                return this._marginLeft;
            },
            set: function (marginLeft) {
                if (marginLeft !== this._marginLeft) {
                    this._marginLeft = marginLeft;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "marginRight", {
            get: function () {
                return this._marginRight;
            },
            set: function (marginRight) {
                if (marginRight !== this._marginRight) {
                    this._marginRight = marginRight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "opacity", {
            get: function () {
                return this._opacity;
            },
            set: function (opacity) {
                if (this._opacity !== opacity) {
                    this._opacity = opacity;
                    this._drawing.style.opacity = this._opacity;
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.focus = function () {
            if (this._focusable) {
                try {
                    this._drawing.focus();
                }
                catch (e) { }
            }
        };
        Element.prototype.blur = function () {
            try {
                this._drawing.blur();
            }
            catch (e) { }
        };
        Object.defineProperty(Element.prototype, "transform", {
            set: function (transform) {
                if (this._transform !== transform) {
                    this._transform = transform;
                    this.updateTransform();
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.setTransformOrigin = function (x, y, absolute) {
            if (absolute === void 0) { absolute = false; }
            if ((this.transformOriginX !== x) || (this.transformOriginY !== y) || (this.transformOriginAbsolute !== absolute)) {
                this.transformOriginX = x;
                this.transformOriginY = y;
                this.transformOriginAbsolute = absolute;
                this.updateTransform();
            }
        };
        Element.prototype.getInverseLayoutTransform = function () {
            var matrix = Ui.Matrix.createTranslate(this._layoutX, this._layoutY);
            if (this._transform !== undefined) {
                var originX = this.transformOriginX * this._layoutWidth;
                var originY = this.transformOriginY * this._layoutHeight;
                matrix = matrix.translate(-originX, -originY).multiply(this._transform).translate(originX, originY);
            }
            return matrix;
        };
        Element.prototype.getLayoutTransform = function () {
            var matrix = new Ui.Matrix();
            if (this._transform !== undefined) {
                var originX = this.transformOriginX * this._layoutWidth;
                var originY = this.transformOriginY * this._layoutHeight;
                matrix = Ui.Matrix.createTranslate(-originX, -originY).
                    multiply(this._transform).
                    translate(originX, originY).
                    inverse();
            }
            return matrix.translate(-this._layoutX, -this._layoutY);
        };
        Element.prototype.transformToWindow = function () {
            return Ui.Element.transformToWindow(this);
        };
        Element.prototype.transformFromWindow = function () {
            return Ui.Element.transformFromWindow(this);
        };
        Element.prototype.transformToElement = function (element) {
            var toMatrix = this.transformToWindow();
            var fromMatrix = element.transformFromWindow();
            return toMatrix.multiply(fromMatrix);
        };
        Element.prototype.pointToWindow = function (point) {
            return point.multiply(this.transformToWindow());
        };
        Element.prototype.pointFromWindow = function (point) {
            return point.multiply(this.transformFromWindow());
        };
        Element.prototype.pointFromElement = function (element, point) {
            return this.pointFromWindow(element.pointToWindow(point));
        };
        Element.prototype.getIsInside = function (point) {
            var p = point.multiply(this.getLayoutTransform());
            if ((p.x >= 0) && (p.x <= this._layoutWidth) &&
                (p.y >= 0) && (p.y <= this._layoutHeight))
                return true;
            return false;
        };
        Object.defineProperty(Element.prototype, "eventsHidden", {
            get: function () {
                return this._eventsHidden;
            },
            set: function (eventsHidden) {
                this._eventsHidden = eventsHidden;
                this.invalidateArrange();
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.elementFromPoint = function (point) {
            if (!this._eventsHidden && this.isVisible && this.getIsInside(point))
                return this;
            else
                return undefined;
        };
        Object.defineProperty(Element.prototype, "measureWidth", {
            get: function () {
                return this.collapse ? 0 : this._measureWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "measureHeight", {
            get: function () {
                return this.collapse ? 0 : this._measureHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "isCollapsed", {
            get: function () {
                return this.collapse;
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.hide = function (collapse) {
            if (collapse === void 0) { collapse = false; }
            if ((this.visible === undefined) || this.visible) {
                var old = this.isVisible;
                this.visible = false;
                this._drawing.style.display = 'none';
                this.collapse = collapse;
                if (old)
                    this.onInternalHidden();
                if (this.collapse)
                    this.invalidateMeasure();
            }
        };
        Element.prototype.show = function () {
            if ((this.visible === undefined) || !this.visible) {
                var old = this.isVisible;
                this.visible = true;
                this._drawing.style.display = 'block';
                if (this.isVisible && !old)
                    this.onInternalVisible();
                if (this.collapse) {
                    this.collapse = false;
                    this.invalidateMeasure();
                }
            }
        };
        Object.defineProperty(Element.prototype, "isVisible", {
            get: function () {
                return ((this._parentVisible === true) && (this.visible !== false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "parentVisible", {
            set: function (visible) {
                var old = this.isVisible;
                this._parentVisible = visible;
                if (old != this.isVisible) {
                    if (this.isVisible)
                        this.onInternalVisible();
                    else
                        this.onInternalHidden();
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.onInternalHidden = function () {
            this.onHidden();
            this.fireEvent('hidden', this);
        };
        Element.prototype.onHidden = function () {
        };
        Element.prototype.onInternalVisible = function () {
            this.onVisible();
            this.fireEvent('visible', this);
        };
        Element.prototype.checkVisible = function () {
            if (this.drawing === undefined)
                return;
            var visible = false;
            var current = this.drawing;
            while (current !== undefined) {
                if (current.style.display === 'none') {
                    visible = false;
                    break;
                }
                if (current == document.body) {
                    visible = true;
                    break;
                }
                current = current.parentNode;
            }
            if (this.isVisible !== visible)
                console.log('checkVisible expect: ' + this.isVisible + ', got: ' + visible + ' (on ' + this + ')');
        };
        Element.prototype.onVisible = function () {
        };
        Element.prototype.disable = function () {
            if ((this.disabled === undefined) || !this.disabled) {
                var old = this.isDisabled;
                this.disabled = true;
                if (!old)
                    this.onInternalDisable();
            }
        };
        Element.prototype.enable = function () {
            if ((this.disabled === undefined) || this.disabled) {
                var old = this.isDisabled;
                this.disabled = false;
                if (old && !this.isDisabled)
                    this.onInternalEnable();
            }
        };
        Element.prototype.setEnable = function (enable) {
            if (enable)
                this.enable();
            else
                this.disable();
        };
        Object.defineProperty(Element.prototype, "isDisabled", {
            get: function () {
                if ((this.disabled !== undefined) && (this.disabled === true))
                    return true;
                if ((this.parentDisabled !== undefined) && (this.parentDisabled === true))
                    return true;
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.setParentDisabled = function (disabled) {
            var old = this.isDisabled;
            this.parentDisabled = disabled;
            if (old !== this.isDisabled) {
                if (this.isDisabled)
                    this.onInternalDisable();
                else
                    this.onInternalEnable();
            }
        };
        Element.prototype.onInternalDisable = function () {
            if (this._focusable) {
                this._drawing.tabIndex = -1;
                if (this._hasFocus)
                    this.blur();
            }
            this.onDisable();
            this.fireEvent('disable', this);
        };
        Element.prototype.onDisable = function () {
        };
        Element.prototype.onInternalEnable = function () {
            if (this._focusable)
                this._drawing.tabIndex = 0;
            this.onEnable();
            this.fireEvent('enable', this);
        };
        Element.prototype.onEnable = function () {
        };
        Element.prototype.containSubStyle = function (style) {
            return style['types'] != undefined && style['types'] instanceof Array;
        };
        Element.prototype.fusionStyle = function (dst, src) {
            if (src['types'] == undefined || !(src['types'] instanceof Array))
                return;
            if (dst['types'] == undefined)
                dst['types'] = [];
            var mergeTypes = [];
            for (var i = 0; i < src['types'].length; i++) {
                var srcStyle = src['types'][i];
                var dstStyle = this.getClassStyle(dst, srcStyle['type']);
                if (dstStyle != undefined) {
                    var mergeStyle = {};
                    for (var prop in dstStyle)
                        mergeStyle[prop] = dstStyle[prop];
                    for (var prop in srcStyle)
                        mergeStyle[prop] = srcStyle[prop];
                    mergeTypes.push(mergeStyle);
                }
                else
                    mergeTypes.push(srcStyle);
            }
            dst['types'] = mergeTypes;
        };
        Element.prototype.getClassStyle = function (style, classFunc) {
            if (style['types'] != undefined && (style['types'] instanceof Array)) {
                var classStyle = undefined;
                for (var i = 0; i < style['types'].length; i++) {
                    var pStyle = style['types'][i];
                    if (pStyle.type == classFunc)
                        return pStyle;
                }
            }
            return undefined;
        };
        Element.prototype.mergeStyles = function () {
            var current;
            var found;
            this.mergeStyle = undefined;
            if (this.parentStyle != undefined) {
                current = this.constructor;
                found = false;
                while (current != undefined) {
                    var classStyle = this.getClassStyle(this.parentStyle, current);
                    if (classStyle != undefined && this.containSubStyle(classStyle)) {
                        if (this.mergeStyle == undefined)
                            this.mergeStyle = Core.Util.clone(this.parentStyle);
                        this.fusionStyle(this.mergeStyle, classStyle);
                        found = true;
                        break;
                    }
                    current = Object.getPrototypeOf(current.prototype);
                    if (current != null)
                        current = current.constructor;
                }
                if (!found)
                    this.mergeStyle = this.parentStyle;
            }
            if (this.style != undefined) {
                if (this.mergeStyle != undefined) {
                    this.mergeStyle = Core.Util.clone(this.mergeStyle);
                    this.fusionStyle(this.mergeStyle, this.style);
                    current = this.constructor;
                    while (current != undefined) {
                        var classStyle = this.getClassStyle(this.style, current);
                        if (classStyle != undefined && this.containSubStyle(classStyle)) {
                            this.fusionStyle(this.mergeStyle, classStyle);
                            break;
                        }
                        current = Object.getPrototypeOf(current.prototype);
                        if (current != null)
                            current = current.constructor;
                    }
                }
                else {
                    current = this.constructor;
                    found = false;
                    while (current != undefined) {
                        var classStyle = this.getClassStyle(this.style, current);
                        if (classStyle != undefined) {
                            if (this.mergeStyle == undefined)
                                this.mergeStyle = Core.Util.clone(this.style);
                            this.fusionStyle(this.mergeStyle, classStyle);
                            found = true;
                            break;
                        }
                        current = Object.getPrototypeOf(current.prototype);
                        if (current != null)
                            current = current.constructor;
                    }
                    if (!found)
                        this.mergeStyle = this.style;
                }
            }
        };
        Element.prototype.getIsChildOf = function (parent) {
            var current = this;
            while (current != undefined) {
                if (current === parent)
                    return true;
                current = current.parent;
            }
            return false;
        };
        Object.defineProperty(Element.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (parent) {
                this._parent = parent;
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.getParentByClass = function (classFunc) {
            var current = this.parent;
            while (current != undefined) {
                if (current.constructor === classFunc)
                    return current;
                current = current.parent;
            }
            return undefined;
        };
        Element.prototype.setParentStyle = function (parentStyle) {
            if (this.parentStyle !== parentStyle)
                this.parentStyle = parentStyle;
            this.mergeStyles();
            this.onInternalStyleChange();
        };
        Element.prototype.setStyle = function (style) {
            console.log(this.getClassName() + '.setStyle');
            console.log(style);
            this.style = style;
            this.mergeStyles();
            this.onInternalStyleChange();
        };
        Element.prototype.setStyleProperty = function (property, value) {
            if (this.style === undefined)
                this.style = {};
            if (this.style[this.getClassName()] === undefined)
                this.style[this.getClassName()] = {};
            this.style[this.getClassName()][property] = value;
        };
        Element.prototype.getStyleProperty = function (property) {
            var current;
            if (this.mergeStyle != undefined) {
                current = this.constructor;
                while (current != undefined) {
                    if (this.mergeStyle['types'] != undefined && (this.mergeStyle['types'] instanceof Array)) {
                        var classStyle = undefined;
                        for (var i = 0; classStyle == undefined && i < this.mergeStyle['types'].length; i++) {
                            var pStyle = this.mergeStyle['types'][i];
                            if (pStyle.type == current)
                                classStyle = pStyle;
                        }
                        if (classStyle != undefined && classStyle[property] != undefined)
                            return classStyle[property];
                    }
                    current = Object.getPrototypeOf(current.prototype);
                    if (current != null)
                        current = current.constructor;
                }
            }
            current = this.constructor;
            while (current != undefined) {
                if (('style' in current) && (property in current.style))
                    return current.style[property];
                current = Object.getPrototypeOf(current);
            }
            return undefined;
        };
        Element.prototype.onInternalStyleChange = function () {
            if (!this._isLoaded)
                return;
            this.onStyleChange();
        };
        Element.prototype.onStyleChange = function () {
        };
        Object.defineProperty(Element.prototype, "hasFocus", {
            get: function () {
                return this._hasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.scrollIntoView = function () {
            this.onScrollIntoView(this);
        };
        Element.prototype.onScrollIntoView = function (el) {
            if (this._parent != undefined)
                this._parent.onScrollIntoView(el);
        };
        Element.prototype.get = function (name) {
            return (this.name == name) ? this : undefined;
        };
        Object.defineProperty(Element.prototype, "isLoaded", {
            get: function () {
                return this._isLoaded;
            },
            set: function (isLoaded) {
                if (this._isLoaded !== isLoaded) {
                    this._isLoaded = isLoaded;
                    if (isLoaded)
                        this.onLoad();
                    else
                        this.onUnload();
                }
            },
            enumerable: true,
            configurable: true
        });
        Element.prototype.onFocus = function (event) {
            if (this._focusable && !this.isDisabled) {
                event.preventDefault();
                event.stopPropagation();
                this._hasFocus = true;
                this.isMouseFocus = this.isMouseDownFocus;
                this.scrollIntoView();
                this.fireEvent('focus', this);
            }
        };
        Element.prototype.onBlur = function (event) {
            if (this._focusable) {
                event.preventDefault();
                event.stopPropagation();
                this.isMouseFocus = false;
                this._hasFocus = false;
                this.fireEvent('blur', this);
            }
        };
        Element.prototype.updateTransform = function () {
            if (this._transform !== undefined) {
                var matrix = this._transform;
                var x = this.transformOriginX;
                var y = this.transformOriginY;
                if (!this.transformOriginAbsolute) {
                    x *= this._layoutWidth;
                    y *= this._layoutHeight;
                }
                if ((x !== 0) || (y !== 0))
                    matrix = Ui.Matrix.createTranslate(x, y).multiply(this._transform).translate(-x, -y);
                this._drawing.style.transform = matrix.toString();
                if (Core.Navigator.isIE)
                    this._drawing.style.msTransform = matrix.toString();
                else if (Core.Navigator.isGecko)
                    this._drawing.style.MozTransform = 'matrix(' + matrix.getA().toFixed(4) + ', ' + matrix.getB().toFixed(4) + ', ' + matrix.getC().toFixed(4) + ', ' + matrix.getD().toFixed(4) + ', ' + matrix.getE().toFixed(4) + 'px, ' + matrix.getF().toFixed(4) + 'px)';
                else if (Core.Navigator.isWebkit)
                    this._drawing.style.webkitTransform = matrix.toString() + ' translate3d(0,0,0)';
                else if (Core.Navigator.isOpera)
                    this._drawing.style.OTransform = matrix.toString();
            }
            else {
                if ('removeProperty' in this._drawing.style)
                    this._drawing.style.removeProperty('transform');
                if (Core.Navigator.isIE && ('removeProperty' in this._drawing.style))
                    this._drawing.style.removeProperty('-ms-transform');
                else if (Core.Navigator.isGecko)
                    this._drawing.style.removeProperty('-moz-transform');
                else if (Core.Navigator.isWebkit)
                    this._drawing.style.removeProperty('-webkit-transform');
                else if (Core.Navigator.isOpera)
                    this._drawing.style.removeProperty('-o-transform');
            }
        };
        Element.prototype.setAnimClock = function (clock) {
            if (this.animClock != undefined)
                this.animClock.stop();
            this.animClock = clock;
            if (clock != undefined)
                this.connect(clock, 'complete', this.onAnimClockComplete);
        };
        Element.prototype.onAnimClockComplete = function () {
            this.animClock = undefined;
        };
        Element.prototype.onLoad = function () {
            if (this._parent != undefined) {
                this.setParentStyle(this._parent.mergeStyle);
                this.setParentDisabled(this._parent.isDisabled);
                this.parentVisible = this._parent.isVisible;
            }
            this.fireEvent('load', this);
        };
        Element.prototype.onUnload = function () {
            if (this.animClock != undefined) {
                this.animClock.stop();
                this.animClock = undefined;
            }
            this.fireEvent('unload', this);
        };
        Element.transformToWindow = function (element) {
            var matrix = new Ui.Matrix();
            var current = element;
            while (current != undefined) {
                matrix = current.getInverseLayoutTransform().multiply(matrix);
                current = current._parent;
            }
            return matrix;
        };
        Element.transformFromWindow = function (element) {
            return Ui.Element.transformToWindow(element).inverse();
        };
        Element.elementFromPoint = function (point) {
            return Ui.App.current.elementFromPoint(point);
        };
        Element.getIsDrawingChildOf = function (drawing, parent) {
            var current = drawing;
            while (current != undefined) {
                if (current === parent)
                    return true;
                current = current.offsetParent;
            }
            return false;
        };
        Element.setSelectable = function (drawing, selectable) {
            drawing.selectable = selectable;
            if (selectable) {
                drawing.style.cursor = 'text';
                drawing.style.userSelect = 'text';
                if (Core.Navigator.isWebkit)
                    drawing.style.webkitUserSelect = 'text';
                else if (Core.Navigator.isGecko)
                    drawing.style.MozUserSelect = 'text';
                else if (Core.Navigator.isIE)
                    drawing.style.msUserSelect = 'element';
            }
            else {
                drawing.style.cursor = 'inherit';
                drawing.style.userSelect = 'none';
                if (Core.Navigator.isWebkit)
                    drawing.style.webkitUserSelect = 'none';
                else if (Core.Navigator.isGecko)
                    drawing.style.MozUserSelect = 'none';
                else if (Core.Navigator.isIE)
                    drawing.style.msUserSelect = 'none';
            }
        };
        return Element;
    }(Core.Object));
    Ui.Element = Element;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Container = (function (_super) {
        __extends(Container, _super);
        function Container(init) {
            var _this = _super.call(this) || this;
            _this._containerDrawing = undefined;
            _this._children = [];
            if (_this._containerDrawing === undefined)
                _this._containerDrawing = _this.drawing;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Container.prototype, "containerDrawing", {
            get: function () {
                return this._containerDrawing;
            },
            set: function (containerDrawing) {
                this._containerDrawing = containerDrawing;
            },
            enumerable: true,
            configurable: true
        });
        Container.prototype.appendChild = function (child) {
            child.parent = this;
            this._children.push(child);
            this._containerDrawing.appendChild(child.drawing);
            child.isLoaded = this.isLoaded;
            child.parentVisible = this.isVisible;
            child.parentDisabled = this.isDisabled;
            this.onChildInvalidateMeasure(child, 'add');
        };
        Container.prototype.prependChild = function (child) {
            child.parent = this;
            this._children.unshift(child);
            if (this._containerDrawing.firstChild !== undefined)
                this._containerDrawing.insertBefore(child.drawing, this._containerDrawing.firstChild);
            else
                this._containerDrawing.appendChild(child.drawing);
            child.isLoaded = this.isLoaded;
            child.parentVisible = this.isVisible;
            child.parentDisabled = this.isDisabled;
            this.onChildInvalidateMeasure(child, 'add');
        };
        Container.prototype.removeChild = function (child) {
            if (child == undefined)
                return;
            child.parent = undefined;
            if (child.drawing != undefined)
                this._containerDrawing.removeChild(child.drawing);
            var i = 0;
            while ((i < this._children.length) && (this._children[i] !== child)) {
                i++;
            }
            if (i < this._children.length)
                this._children.splice(i, 1);
            child.isLoaded = false;
            child.parentVisible = false;
            this.onChildInvalidateMeasure(child, 'remove');
        };
        Container.prototype.insertChildAt = function (child, position) {
            position = Math.max(0, Math.min(position, this._children.length));
            child.parent = this;
            this._children.splice(position, 0, child);
            if ((this._containerDrawing.firstChild !== undefined) && (position < this._children.length - 1))
                this._containerDrawing.insertBefore(child.drawing, this._containerDrawing.childNodes[position]);
            else
                this._containerDrawing.appendChild(child.drawing);
            child.isLoaded = this.isLoaded;
            child.parentVisible = this.isVisible;
            child.parentDisabled = this.isDisabled;
            this.onChildInvalidateMeasure(child, 'add');
        };
        Container.prototype.insertChildBefore = function (child, beforeChild) {
            this.insertChildAt(child, this.getChildPosition(beforeChild));
        };
        Container.prototype.moveChildAt = function (child, position) {
            if (position < 0)
                position = this._children.length + position;
            if (position < 0)
                position = 0;
            if (position >= this._children.length)
                position = this._children.length;
            var i = 0;
            while ((i < this._children.length) && (this._children[i] !== child)) {
                i++;
            }
            if (i < this._children.length) {
                this._children.splice(i, 1);
                this._children.splice(position, 0, child);
                this._containerDrawing.removeChild(child.drawing);
                if ((this._containerDrawing.firstChild !== undefined) && (position < this._containerDrawing.childNodes.length))
                    this._containerDrawing.insertBefore(child.drawing, this._containerDrawing.childNodes[position]);
                else
                    this._containerDrawing.appendChild(child.drawing);
            }
            this.onChildInvalidateMeasure(child, 'move');
        };
        Object.defineProperty(Container.prototype, "children", {
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container.prototype, "firstChild", {
            get: function () {
                if (this._children.length > 0)
                    return this._children[0];
                else
                    return undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container.prototype, "lastChild", {
            get: function () {
                if (this._children.length > 0)
                    return this._children[this._children.length - 1];
                else
                    return undefined;
            },
            enumerable: true,
            configurable: true
        });
        Container.prototype.getChildPosition = function (child) {
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i] === child) {
                    return i;
                }
            }
            return -1;
        };
        Container.prototype.hasChild = function (child) {
            return this.getChildPosition(child) !== -1;
        };
        Container.prototype.clear = function () {
            while (this.firstChild !== undefined) {
                this.removeChild(this.firstChild);
            }
        };
        Container.prototype.get = function (name) {
            if (this.name == name)
                return this;
            else {
                for (var i = 0; i < this._children.length; i++) {
                    var child = this._children[i];
                    var res = child.get(name);
                    if (res != undefined)
                        return res;
                }
            }
            return undefined;
        };
        Container.prototype.elementFromPoint = function (point) {
            if (!this.isVisible)
                return undefined;
            var p = point.multiply(this.getLayoutTransform());
            var isInside = ((p.x >= 0) && (p.x <= this.layoutWidth) &&
                (p.y >= 0) && (p.y <= this.layoutHeight));
            if (this.clipToBounds && !isInside)
                return undefined;
            if (this._children != undefined) {
                for (var i = this._children.length - 1; i >= 0; i--) {
                    var found = this._children[i].elementFromPoint(p);
                    if (found != undefined)
                        return found;
                }
            }
            if (!this.eventsHidden && isInside)
                return this;
            return undefined;
        };
        Container.prototype.onLoad = function () {
            _super.prototype.onLoad.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].isLoaded = this.isLoaded;
        };
        Container.prototype.onUnload = function () {
            _super.prototype.onUnload.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].isLoaded = this.isLoaded;
        };
        Container.prototype.onInternalStyleChange = function () {
            if (!this.isLoaded)
                return;
            this.onStyleChange();
            if (this._children !== undefined) {
                for (var i = 0; i < this._children.length; i++)
                    this._children[i].setParentStyle(this.mergeStyle);
            }
        };
        Container.prototype.onInternalDisable = function () {
            _super.prototype.onInternalDisable.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].setParentDisabled(true);
        };
        Container.prototype.onInternalEnable = function () {
            _super.prototype.onInternalEnable.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].setParentDisabled(false);
        };
        Container.prototype.onInternalVisible = function () {
            _super.prototype.onInternalVisible.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].parentVisible = true;
        };
        Container.prototype.onInternalHidden = function () {
            _super.prototype.onInternalHidden.call(this);
            for (var i = 0; i < this._children.length; i++)
                this._children[i].parentVisible = false;
        };
        return Container;
    }(Ui.Element));
    Ui.Container = Container;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var SvgParser = (function (_super) {
        __extends(SvgParser, _super);
        function SvgParser(path) {
            var _this = _super.call(this) || this;
            _this.path = undefined;
            _this.pos = 0;
            _this.cmd = undefined;
            _this.current = undefined;
            _this.value = false;
            _this.end = false;
            _this.path = path;
            return _this;
        }
        SvgParser.prototype.isEnd = function () {
            return this.end;
        };
        SvgParser.prototype.next = function () {
            this.end = this.pos >= this.path.length;
            if (!this.end) {
                while ((this.pos < this.path.length) && ((this.path[this.pos] == ' ') || (this.path[this.pos] == ',') || (this.path[this.pos] == ';')))
                    this.pos++;
                var dotseen = false;
                var eseen = false;
                this.current = '';
                var c = this.path[this.pos];
                var isCmd = (c !== 'e') && ((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z'));
                if (isCmd) {
                    this.current = this.path[this.pos++];
                    this.cmd = this.current;
                    this.value = false;
                }
                else {
                    while ((this.pos < this.path.length) && (((this.path[this.pos] >= '0') && (this.path[this.pos] <= '9')) ||
                        ((this.path[this.pos] === '-') && ((this.current.length == 0) || (this.current[this.current.length - 1] === 'e'))) ||
                        (!eseen && (this.path[this.pos] === 'e')) || (!dotseen && (this.path[this.pos] === '.')))) {
                        if (this.path[this.pos] === '.')
                            dotseen = true;
                        if (this.path[this.pos] === 'e')
                            eseen = true;
                        this.current += this.path[this.pos++];
                    }
                    this.value = true;
                    if (this.current[0] === '.')
                        this.current = '0' + this.current;
                    if ((this.current[0] === '-') && (this.current[1] === '.'))
                        this.current = '-0' + this.current.substring(1);
                    this.current = parseFloat(this.current);
                    if (isNaN(this.current))
                        throw ('bad number');
                }
            }
        };
        SvgParser.prototype.setCmd = function (cmd) {
            this.cmd = cmd;
        };
        SvgParser.prototype.getCmd = function () {
            return this.cmd;
        };
        SvgParser.prototype.getCurrent = function () {
            return this.current;
        };
        SvgParser.prototype.isCmd = function () {
            return !this.value;
        };
        SvgParser.prototype.isValue = function () {
            return this.value;
        };
        return SvgParser;
    }(Core.Object));
    Ui.SvgParser = SvgParser;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var CanvasElement = (function (_super) {
        __extends(CanvasElement, _super);
        function CanvasElement(init) {
            var _this = _super.call(this) || this;
            _this.canvasEngine = 'svg';
            _this._context = undefined;
            _this.svgDrawing = undefined;
            _this.dpiRatio = 1;
            _this.selectable = false;
            if (init)
                _this.assign(init);
            return _this;
        }
        CanvasElement.prototype.update = function () {
            if (this.canvasEngine === 'canvas') {
                this._context.clearRect(0, 0, Math.ceil(this.layoutWidth * this.dpiRatio), Math.ceil(this.layoutHeight * this.dpiRatio));
                this._context.save();
                if (this.dpiRatio !== 1)
                    this._context.scale(this.dpiRatio, this.dpiRatio);
                this.updateCanvas(this._context);
                this._context.restore();
            }
            else {
                if (this.svgDrawing !== undefined)
                    this.drawing.removeChild(this.svgDrawing);
                var svgDrawing = document.createElementNS(svgNS, 'svg');
                svgDrawing.style.position = 'absolute';
                svgDrawing.style.top = '0px';
                svgDrawing.style.left = '0px';
                svgDrawing.style.width = this.layoutWidth + 'px';
                svgDrawing.style.height = this.layoutHeight + 'px';
                svgDrawing.setAttribute('focusable', 'false');
                svgDrawing.setAttribute('draggable', 'false');
                svgDrawing.setAttribute('pointer-events', 'none');
                var ctx = new Core.SVG2DContext(svgDrawing);
                this.updateCanvas(ctx);
                this.svgDrawing = svgDrawing;
                this.svgDrawing.appendChild(ctx.getSVG());
                this.drawing.appendChild(this.svgDrawing);
            }
        };
        Object.defineProperty(CanvasElement.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        CanvasElement.prototype.updateCanvas = function (context) {
        };
        CanvasElement.prototype.renderDrawing = function () {
            if ((this.canvasEngine === 'canvas') && !Core.Navigator.supportCanvas)
                this.canvasEngine = 'svg';
            if ((this.canvasEngine === 'svg') && !Core.Navigator.supportSVG)
                this.canvasEngine = 'canvas';
            var drawing;
            var resourceDrawing;
            if (this.canvasEngine === 'canvas') {
                drawing = document.createElement('canvas');
                this._context = drawing.getContext('2d');
            }
            else {
                drawing = document.createElement('div');
                resourceDrawing = document.createElement('div');
                resourceDrawing.style.width = '0px';
                resourceDrawing.style.height = '0px';
                resourceDrawing.style.visibility = 'hidden';
                drawing.appendChild(resourceDrawing);
                this.containerDrawing = resourceDrawing;
                if (Core.Navigator.supportCanvas)
                    drawing.toDataURL = this.svgToDataURL.bind(this);
            }
            return drawing;
        };
        CanvasElement.prototype.svgToDataURL = function () {
            var drawing = document.createElement('canvas');
            var context = drawing.getContext('2d');
            drawing.setAttribute('width', Math.ceil(this.layoutWidth).toString());
            drawing.setAttribute('height', Math.ceil(this.layoutHeight).toString());
            this.updateCanvas(context);
            return drawing.toDataURL.apply(drawing, arguments);
        };
        CanvasElement.prototype.arrangeCore = function (width, height) {
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = 1;
            if (this._context !== undefined) {
                backingStoreRatio = this._context.webkitBackingStorePixelRatio ||
                    this._context.mozBackingStorePixelRatio ||
                    this._context.msBackingStorePixelRatio ||
                    this._context.oBackingStorePixelRatio ||
                    this._context.backingStorePixelRatio || 1;
            }
            this.dpiRatio = devicePixelRatio / backingStoreRatio;
            this.drawing.setAttribute('width', Math.ceil(width * this.dpiRatio), null);
            this.drawing.setAttribute('height', Math.ceil(height * this.dpiRatio), null);
            if (this.isVisible && this.isLoaded)
                this.update();
        };
        CanvasElement.prototype.drawCore = function () {
            if ((this.layoutWidth !== 0) && (this.layoutHeight !== 0))
                this.update();
        };
        CanvasElement.prototype.onInternalVisible = function () {
            _super.prototype.onInternalVisible.call(this);
            this.invalidateDraw();
        };
        return CanvasElement;
    }(Ui.Container));
    Ui.CanvasElement = CanvasElement;
})(Ui || (Ui = {}));
var Core;
(function (Core) {
    var SVG2DPath = (function (_super) {
        __extends(SVG2DPath, _super);
        function SVG2DPath() {
            var _this = _super.call(this) || this;
            _this.d = undefined;
            _this.x = 0;
            _this.y = 0;
            _this.d = '';
            return _this;
        }
        SVG2DPath.prototype.moveTo = function (x, y) {
            this.d += ' M ' + x + ' ' + y;
            this.x = x;
            this.y = y;
        };
        SVG2DPath.prototype.lineTo = function (x, y) {
            this.d += ' L ' + x + ' ' + y;
            this.x = x;
            this.y = y;
        };
        SVG2DPath.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            this.d += ' Q ' + cpx + ' ' + cpy + ' ' + x + ' ' + y;
            this.x = x;
            this.y = y;
        };
        SVG2DPath.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.d += ' C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + x + ' ' + y;
            this.x = x;
            this.y = y;
        };
        SVG2DPath.prototype.arcTo = function (x1, y1, x2, y2, radiusX, radiusY, angle) {
            var vx1 = this.x - x1;
            var vy1 = this.y - y1;
            var vx2 = x2 - x1;
            var vy2 = y2 - y1;
            var p = vx1 * vy2 - vy1 * vx2;
            if (angle === undefined) {
                angle = radiusY;
                radiusY = radiusX;
            }
            this.d += ' A ' + radiusX + ' ' + radiusY + ' ' + (angle * Math.PI / 180) + ' 0 ' + ((p < 0) ? 1 : 0) + ' ' + x2 + ' ' + y2;
            this.x = x2;
            this.y = y2;
        };
        SVG2DPath.prototype.closePath = function () {
            this.d += ' Z';
        };
        SVG2DPath.prototype.rect = function (x, y, w, h) {
            this.moveTo(x, y);
            this.lineTo(x + w, y);
            this.lineTo(x + w, y + h);
            this.lineTo(x, y + h);
        };
        SVG2DPath.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
            this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, anticlockwise);
        };
        SVG2DPath.prototype.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            if ((rotation === 0) && (startAngle === 0) && (endAngle === Math.PI * 2)) {
                this.moveTo(x, y + radiusY);
                this.arcTo(x + radiusX, y + radiusY, x + radiusX, y, radiusX, radiusY, Math.PI / 2);
                this.arcTo(x + radiusX, y - radiusY, x, y - radiusY, radiusX, radiusY, Math.PI / 2);
                this.arcTo(x - radiusX, y - radiusY, x - radiusX, y, radiusX, radiusY, Math.PI / 2);
                this.arcTo(x - radiusX, y + radiusY, x, y + radiusY, radiusX, radiusY, Math.PI / 2);
            }
            else {
                var startX = x + Math.cos(startAngle) * radiusX;
                var startY = y + Math.sin(startAngle) * radiusY;
                var endX = x + Math.cos(endAngle) * radiusX;
                var endY = y + Math.sin(endAngle) * radiusY;
                this.moveTo(startX, startY);
                var largeArc = (((endAngle - startAngle) + Math.PI * 2) % (Math.PI * 2)) > Math.PI;
                if (anticlockwise)
                    largeArc = !largeArc;
                this.d += ' A ' + radiusX + ' ' + radiusY + ' ' + ((endAngle - startAngle) * Math.PI / 180) + ' ' + (largeArc ? 1 : 0) + ' ' + (!anticlockwise ? 1 : 0) + ' ' + endX + ' ' + endY;
                this.x = endX;
                this.y = endY;
            }
        };
        SVG2DPath.prototype.roundRect = function (x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise) {
            if (antiClockwise === true) {
                this.moveTo(x + radiusTopLeft, y);
                if (radiusTopLeft > 0)
                    this.arcTo(x, y, x, y + radiusTopLeft, radiusTopLeft, radiusTopLeft, Math.PI / 4);
                this.lineTo(x, y + h - radiusBottomLeft);
                if (radiusBottomLeft > 0)
                    this.arcTo(x, y + h, x + radiusBottomLeft, y + h, radiusBottomLeft, radiusBottomLeft, Math.PI / 4);
                this.lineTo(x + w - radiusBottomRight, y + h);
                if (radiusBottomRight > 0)
                    this.arcTo(x + w, y + h, x + w, y + h - radiusBottomRight, radiusBottomRight, radiusBottomRight, Math.PI / 4);
                this.lineTo(x + w, y + radiusTopRight);
                if (radiusTopRight > 0)
                    this.arcTo(x + w, y, x + w - radiusTopRight, y, radiusTopRight, radiusTopRight, Math.PI / 4);
            }
            else {
                this.moveTo(x, y + radiusTopLeft);
                if (radiusTopLeft > 0)
                    this.arcTo(x, y, x + radiusTopLeft, y, radiusTopLeft, radiusTopLeft, Math.PI / 4);
                this.lineTo(x + w - radiusTopRight, y);
                if (radiusTopRight > 0)
                    this.arcTo(x + w, y, x + w, y + radiusTopRight, radiusTopRight, radiusTopRight, Math.PI / 4);
                this.lineTo(x + w, y + h - radiusBottomRight);
                if (radiusBottomRight > 0)
                    this.arcTo(x + w, y + h, x + w - radiusBottomRight, y + h, radiusBottomRight, radiusBottomRight, Math.PI / 4);
                this.lineTo(x + radiusBottomLeft, y + h);
                if (radiusBottomLeft > 0)
                    this.arcTo(x, y + h, x, y + h - radiusBottomLeft, radiusBottomLeft, radiusBottomLeft, Math.PI / 4);
            }
        };
        SVG2DPath.prototype.getSVG = function () {
            var path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', this.d);
            return path;
        };
        return SVG2DPath;
    }(Core.Object));
    Core.SVG2DPath = SVG2DPath;
    var SVGGradient = (function (_super) {
        __extends(SVGGradient, _super);
        function SVGGradient(x0, y0, x1, y1) {
            var _this = _super.call(this) || this;
            _this.gradient = undefined;
            _this.id = undefined;
            _this.gradient = document.createElementNS(svgNS, 'linearGradient');
            _this.gradient.setAttributeNS(null, 'gradientUnits', 'userSpaceOnUse');
            _this.gradient.setAttributeNS(null, 'x1', x0);
            _this.gradient.setAttributeNS(null, 'y1', y0);
            _this.gradient.setAttributeNS(null, 'x2', x1);
            _this.gradient.setAttributeNS(null, 'y2', y1);
            _this.id = '_grad' + (++Core.SVGGradient.counter);
            _this.gradient.setAttributeNS(null, 'id', _this.id);
            return _this;
        }
        SVGGradient.prototype.getId = function () {
            return this.id;
        };
        SVGGradient.prototype.addColorStop = function (offset, color) {
            var svgStop = document.createElementNS(svgNS, 'stop');
            svgStop.setAttributeNS(null, 'offset', offset);
            svgStop.style.stopColor = color;
            color = Ui.Color.create(color);
            svgStop.style.stopOpacity = color.getRgba().a;
            this.gradient.appendChild(svgStop);
        };
        SVGGradient.prototype.getSVG = function () {
            return this.gradient;
        };
        SVGGradient.counter = 0;
        return SVGGradient;
    }(Core.Object));
    Core.SVGGradient = SVGGradient;
    var SVG2DContext = (function (_super) {
        __extends(SVG2DContext, _super);
        function SVG2DContext(svgElement) {
            var _this = _super.call(this) || this;
            _this.fillStyle = 'black';
            _this.strokeStyle = 'black';
            _this.lineWidth = 1;
            _this.lineDash = undefined;
            _this.globalAlpha = 1;
            _this.currentTransform = undefined;
            _this.font = 'default 10px sans-serif';
            _this.textAlign = 'start';
            _this.textBaseline = 'alphabetic';
            _this.direction = 'inherit';
            _this.clipId = undefined;
            _this.document = undefined;
            _this.currentPath = undefined;
            _this.g = undefined;
            _this.defs = undefined;
            _this.states = undefined;
            _this.document = svgElement;
            _this.g = document.createElementNS(svgNS, 'g');
            _this.currentTransform = _this.document.createSVGMatrix();
            _this.states = [];
            _this.lineDash = [];
            _this.defs = document.createElementNS(svgNS, 'defs');
            _this.g.appendChild(_this.defs);
            return _this;
        }
        SVG2DContext.prototype.beginPath = function () {
            this.currentPath = new Core.SVG2DPath();
        };
        SVG2DContext.prototype.moveTo = function (x, y) {
            this.currentPath.moveTo(x, y);
        };
        SVG2DContext.prototype.lineTo = function (x, y) {
            this.currentPath.lineTo(x, y);
        };
        SVG2DContext.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            this.currentPath.quadraticCurveTo(cpx, cpy, x, y);
        };
        SVG2DContext.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.currentPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        };
        SVG2DContext.prototype.rect = function (x, y, w, h) {
            this.currentPath.rect(x, y, w, h);
        };
        SVG2DContext.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
            this.currentPath.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        };
        SVG2DContext.prototype.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            this.currentPath.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        };
        SVG2DContext.prototype.roundRect = function (x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise) {
            if (antiClockwise === void 0) { antiClockwise = false; }
            this.currentPath.roundRect(x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise);
        };
        SVG2DContext.prototype.closePath = function () {
            this.currentPath.closePath();
        };
        SVG2DContext.prototype.fill = function () {
            var svg = this.currentPath.getSVG();
            if (this.fillStyle instanceof Core.SVGGradient) {
                var id = this.fillStyle.getId();
                this.defs.appendChild(this.fillStyle.getSVG());
                svg.style.fill = 'url(#' + id + ')';
            }
            else
                svg.style.fill = this.fillStyle;
            if (this.clipId !== undefined)
                svg.setAttributeNS(null, 'clip-path', 'url(#' + this.clipId + ')');
            svg.style.opacity = this.globalAlpha;
            svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
            this.g.appendChild(svg);
        };
        SVG2DContext.prototype.stroke = function () {
            var svg = this.currentPath.getSVG();
            svg.style.stroke = this.strokeStyle;
            svg.style.fill = 'none';
            svg.style.opacity = this.globalAlpha;
            svg.style.strokeWidth = this.lineWidth;
            if (this.clipId !== undefined)
                svg.setAttributeNS(null, 'clip-path', 'url(#' + this.clipId + ')');
            if (this.lineDash.length !== 0)
                svg.setAttributeNS(null, 'stroke-dasharray', this.lineDash.join(','));
            svg.setAttributeNS(null, 'pointer-events', 'none');
            svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
            this.g.appendChild(svg);
        };
        SVG2DContext.prototype.clip = function () {
            var clip = document.createElementNS(svgNS, 'clipPath');
            this.clipId = '_clip' + (++Core.SVG2DContext.counter);
            clip.setAttributeNS(null, 'id', this.clipId);
            clip.appendChild(this.currentPath.getSVG());
            this.defs.appendChild(clip);
        };
        SVG2DContext.prototype.resetClip = function () {
            this.clipId = undefined;
        };
        SVG2DContext.prototype.getLineDash = function () {
            return this.lineDash;
        };
        SVG2DContext.prototype.setLineDash = function (lineDash) {
            this.lineDash = lineDash;
        };
        SVG2DContext.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var img;
            var nw = image.naturalWidth;
            var nh = image.naturalHeight;
            if (sw === undefined) {
                dx = sx;
                dy = sy;
                sx = 0;
                sy = 0;
                sw = nw;
                sh = nh;
                dw = nw;
                dh = nh;
            }
            else if (dx === undefined) {
                dx = sx;
                dy = sy;
                dw = sw;
                dh = sh;
                sx = 0;
                sy = 0;
                sw = nw;
                sh = nh;
            }
            if ((sx === 0) && (sy === 0) && (sw === nw) && (sh == nh)) {
                img = document.createElementNS(svgNS, 'image');
                if (this.clipId !== undefined)
                    img.setAttributeNS(null, 'clip-path', 'url(#' + this.clipId + ')');
                img.style.opacity = this.globalAlpha;
                img.setAttributeNS(null, 'pointer-events', 'none');
                img.href.baseVal = image.src;
                img.setAttributeNS(null, 'x', dx);
                img.setAttributeNS(null, 'y', dy);
                img.setAttributeNS(null, 'width', dw);
                img.setAttributeNS(null, 'height', dh);
                img.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
                this.g.appendChild(img);
            }
            else {
                var pattern = document.createElementNS(svgNS, 'pattern');
                var id = '_pat' + (++Core.SVG2DContext.counter);
                pattern.setAttributeNS(null, 'id', id);
                pattern.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');
                pattern.setAttributeNS(null, 'x', dx);
                pattern.setAttributeNS(null, 'y', dy);
                pattern.setAttributeNS(null, 'width', dw);
                pattern.setAttributeNS(null, 'height', dh);
                img = document.createElementNS(svgNS, 'image');
                img.href.baseVal = image.src;
                img.setAttributeNS(null, 'x', -sx * dw / sw);
                img.setAttributeNS(null, 'y', -sy * dh / sh);
                img.setAttributeNS(null, 'width', nw * dw / sw);
                img.setAttributeNS(null, 'height', nh * dh / sh);
                pattern.appendChild(img);
                this.defs.appendChild(pattern);
                var path = document.createElementNS(svgNS, 'path');
                path.setAttributeNS(null, 'pointer-events', 'none');
                path.setAttributeNS(null, 'd', 'M ' + dx + ' ' + dy + ' L ' + (dx + dw) + ' ' + dy + ' L ' + (dx + dw) + ' ' + (dy + dh) + ' L ' + dx + ' ' + (dy + dh) + ' Z');
                path.style.fill = 'url(#' + id + ')';
                if (this.clipId !== undefined)
                    path.setAttributeNS(null, 'clip-path', 'url(#' + this.clipId + ')');
                path.style.opacity = this.globalAlpha;
                path.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
                this.g.appendChild(path);
            }
        };
        SVG2DContext.prototype.fillText = function (text, x, y, maxWidth) {
            var t = document.createElementNS(svgNS, 'text');
            var textNode = document.createTextNode(text);
            t.appendChild(textNode);
            t.style.fill = this.fillStyle;
            t.style.opacity = this.globalAlpha;
            t.setAttributeNS(null, 'pointer-events', 'none');
            t.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
            if (this.textAlign == 'center')
                t.style.textAnchor = 'middle';
            else if (this.textAlign == 'end')
                t.style.textAnchor = 'end';
            else if (this.textAlign == 'right')
                t.style.textAnchor = 'end';
            var font = this.parseFont(this.font);
            t.style.fontFamily = font.family;
            t.style.fontWeight = font.weight;
            t.style.fontSize = font.size;
            t.style.fontStyle = font.style;
            if (!Core.Navigator.isWebkit) {
                var fontSize = font.size;
                if (this.textBaseline === 'top')
                    y += fontSize * 0.8;
                else if (this.textBaseline === 'hanging')
                    y += fontSize * 0.8;
                else if (this.textBaseline === 'middle')
                    y += (fontSize * 0.8) / 2;
                else if (this.textBaseline === 'bottom')
                    y += fontSize * -0.2;
            }
            else {
                if (this.textBaseline === 'top')
                    t.style.alignmentBaseline = 'text-before-edge';
                else if (this.textBaseline === 'hanging')
                    t.style.alignmentBaseline = 'text-before-edge';
                else if (this.textBaseline === 'middle')
                    t.style.alignmentBaseline = 'central';
                else if (this.textBaseline === 'alphabetic')
                    t.style.alignmentBaseline = 'alphabetic';
                else if (this.textBaseline === 'ideographic')
                    t.style.alignmentBaseline = 'ideographic';
                else if (this.textBaseline === 'bottom')
                    t.style.alignmentBaseline = 'text-after-edge';
            }
            t.setAttributeNS(null, 'x', x);
            t.setAttributeNS(null, 'y', y);
            this.g.appendChild(t);
        };
        SVG2DContext.prototype.strokeText = function (text, x, y, maxWidth) {
        };
        SVG2DContext.prototype.save = function () {
            var state = {
                fillStyle: this.fillStyle,
                strokeStyle: this.strokeStyle,
                lineWidth: this.lineWidth,
                lineDash: this.lineDash,
                globalAlpha: this.globalAlpha,
                matrix: {
                    a: this.currentTransform.a, b: this.currentTransform.b,
                    c: this.currentTransform.c, d: this.currentTransform.d,
                    e: this.currentTransform.e, f: this.currentTransform.f
                },
                font: this.font,
                textAlign: this.textAlign,
                textBaseline: this.textBaseline,
                direction: this.direction,
                clipId: this.clipId
            };
            this.states.push(state);
        };
        SVG2DContext.prototype.restore = function () {
            if (this.states.length > 0) {
                var state = this.states.pop();
                this.fillStyle = state.fillStyle;
                this.strokeStyle = state.strokeStyle;
                this.lineWidth = state.lineWidth;
                this.lineDash = state.lineDash;
                this.globalAlpha = state.globalAlpha;
                this.currentTransform = this.document.createSVGMatrix();
                this.currentTransform.a = state.matrix.a;
                this.currentTransform.b = state.matrix.b;
                this.currentTransform.c = state.matrix.c;
                this.currentTransform.d = state.matrix.d;
                this.currentTransform.e = state.matrix.e;
                this.currentTransform.f = state.matrix.f;
                this.font = state.font;
                this.textAlign = state.textAlign;
                this.textBaseline = state.textBaseline;
                this.direction = state.direction;
                this.clipId = state.clipId;
            }
        };
        SVG2DContext.prototype.scale = function (x, y) {
            this.currentTransform = this.currentTransform.scaleNonUniform(x, (y === undefined) ? x : y);
        };
        SVG2DContext.prototype.rotate = function (angle) {
            this.currentTransform = this.currentTransform.rotate(angle * 180 / Math.PI);
        };
        SVG2DContext.prototype.translate = function (x, y) {
            this.currentTransform = this.currentTransform.translate(x, y);
        };
        SVG2DContext.prototype.transform = function (a, b, c, d, e, f) {
            var mulMatrix = this.document.createSVGMatrix();
            mulMatrix.a = a;
            mulMatrix.b = b;
            mulMatrix.c = c;
            mulMatrix.d = d;
            mulMatrix.e = e;
            mulMatrix.f = f;
            this.currentTransform = this.currentTransform.multiply(mulMatrix);
        };
        SVG2DContext.prototype.setTransform = function (a, b, c, d, e, f) {
            this.currentTransform.a = a;
            this.currentTransform.b = b;
            this.currentTransform.c = c;
            this.currentTransform.d = d;
            this.currentTransform.e = e;
            this.currentTransform.f = f;
        };
        SVG2DContext.prototype.resetTransform = function () {
            this.currentTransform = this.document.createSVGMatrix();
        };
        SVG2DContext.prototype.clearRect = function (x, y, w, h) {
        };
        SVG2DContext.prototype.fillRect = function (x, y, w, h) {
            this.beginPath();
            this.currentPath.rect(x, y, w, h);
            this.closePath();
            this.fill();
        };
        SVG2DContext.prototype.strokeRect = function (x, y, w, h) {
            this.beginPath();
            this.currentPath.rect(x, y, w, h);
            this.closePath();
            this.stroke();
        };
        SVG2DContext.prototype.createLinearGradient = function (x0, y0, x1, y1) {
            return new Core.SVGGradient(x0, y0, x1, y1);
        };
        SVG2DContext.prototype.measureText = function (text) {
            var font = this.parseFont(this.font);
            return Ui.Label.measureText(text, font.size, font.family, font.weight);
        };
        SVG2DContext.prototype.svgPath = function (path) {
            var x = 0;
            var y = 0;
            var x1;
            var y1;
            var x2;
            var y2;
            var x3;
            var y3;
            var beginX = 0;
            var beginY = 0;
            var parser = new Ui.SvgParser(path);
            parser.next();
            this.beginPath();
            while (!parser.isEnd()) {
                var cmd = parser.getCmd();
                if (parser.isCmd())
                    parser.next();
                if (cmd === 'm') {
                    parser.setCmd('l');
                    x += parser.getCurrent();
                    parser.next();
                    y += parser.getCurrent();
                    parser.next();
                    beginX = x;
                    beginY = y;
                    this.moveTo(x, y);
                }
                else if (cmd === 'M') {
                    parser.setCmd('L');
                    x = parser.getCurrent();
                    parser.next();
                    y = parser.getCurrent();
                    parser.next();
                    beginX = x;
                    beginY = y;
                    this.moveTo(x, y);
                }
                else if (cmd === 'l') {
                    x += parser.getCurrent();
                    parser.next();
                    y += parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'L') {
                    x = parser.getCurrent();
                    parser.next();
                    y = parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'v') {
                    y += parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'V') {
                    y = parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'h') {
                    x += parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'H') {
                    x = parser.getCurrent();
                    parser.next();
                    this.lineTo(x, y);
                }
                else if (cmd === 'c') {
                    x1 = x + parser.getCurrent();
                    parser.next();
                    y1 = y + parser.getCurrent();
                    parser.next();
                    x2 = x + parser.getCurrent();
                    parser.next();
                    y2 = y + parser.getCurrent();
                    parser.next();
                    x3 = x + parser.getCurrent();
                    parser.next();
                    y3 = y + parser.getCurrent();
                    parser.next();
                    this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                    x = x3;
                    y = y3;
                }
                else if (cmd === 'C') {
                    x1 = parser.getCurrent();
                    parser.next();
                    y1 = parser.getCurrent();
                    parser.next();
                    x2 = parser.getCurrent();
                    parser.next();
                    y2 = parser.getCurrent();
                    parser.next();
                    x3 = parser.getCurrent();
                    parser.next();
                    y3 = parser.getCurrent();
                    parser.next();
                    this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                    x = x3;
                    y = y3;
                }
                else if (cmd === 's') {
                    x1 = x + parser.getCurrent();
                    parser.next();
                    y1 = y + parser.getCurrent();
                    parser.next();
                    x2 = x1;
                    y2 = y1;
                    x3 = x + parser.getCurrent();
                    parser.next();
                    y3 = y + parser.getCurrent();
                    parser.next();
                    this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                    this.lineTo(x3, y3);
                    x = x3;
                    y = y3;
                }
                else if (cmd === 'S') {
                    x1 = parser.getCurrent();
                    parser.next();
                    y1 = parser.getCurrent();
                    parser.next();
                    x2 = x1;
                    y2 = y1;
                    x3 = parser.getCurrent();
                    parser.next();
                    y3 = parser.getCurrent();
                    parser.next();
                    this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                    x = x3;
                    y = y3;
                }
                else if (cmd === 'q') {
                    x1 = x + parser.getCurrent();
                    parser.next();
                    y1 = y + parser.getCurrent();
                    parser.next();
                    x2 = x + parser.getCurrent();
                    parser.next();
                    y2 = y + parser.getCurrent();
                    parser.next();
                    this.quadraticCurveTo(x1, y1, x2, y2);
                    x = x2;
                    y = y2;
                }
                else if (cmd === 'Q') {
                    x1 = parser.getCurrent();
                    parser.next();
                    y1 = parser.getCurrent();
                    parser.next();
                    x2 = parser.getCurrent();
                    parser.next();
                    y2 = parser.getCurrent();
                    parser.next();
                    this.quadraticCurveTo(x1, y1, x2, y2);
                    x = x2;
                    y = y2;
                }
                else if ((cmd === 'z') || (cmd === 'Z')) {
                    x = beginX;
                    y = beginY;
                    this.closePath();
                }
                else {
                    throw ('Invalid SVG path cmd: ' + cmd + ' (' + path + ')');
                }
            }
        };
        SVG2DContext.prototype.parseFont = function (font) {
            var tab = font.split(' ');
            if (tab.length === 1)
                return { style: 'default', weight: 'normal', size: 16, family: tab[0] };
            if (tab.length === 2)
                return { style: 'default', weight: 'normal', size: parseInt(tab[0]), family: tab[1] };
            else if (tab.length === 3)
                return { style: 'default', weight: tab[0], size: parseInt(tab[1]), family: tab[2] };
            else if (tab.length === 4)
                return { style: tab[0], weight: tab[1], size: parseInt(tab[2]), family: tab[3] };
        };
        SVG2DContext.prototype.roundRectFilledShadow = function (x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, inner, shadowWidth, color) {
            this.save();
            var rgba = color.getRgba();
            for (var i = 0; i < shadowWidth; i++) {
                var opacity = void 0;
                if (inner) {
                    if (shadowWidth == 1)
                        opacity = 1;
                    else {
                        var tx = (i + 1) / shadowWidth;
                        opacity = tx * tx;
                    }
                }
                else
                    opacity = (i + 1) / (shadowWidth + 1);
                color = new Ui.Color(rgba.r, rgba.g, rgba.b, rgba.a * opacity);
                this.fillStyle = color.getCssRgba();
                if (inner) {
                    this.beginPath();
                    this.roundRect(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
                    this.roundRect(x + shadowWidth - i, y + shadowWidth - i, width - ((shadowWidth - i) * 2), height - ((shadowWidth - i) * 2), radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, true);
                    this.closePath();
                    this.fill();
                }
                else {
                    this.beginPath();
                    this.roundRect(x + i, y + i, width - i * 2, height - i * 2, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
                    this.closePath();
                    this.fill();
                }
            }
            this.restore();
        };
        SVG2DContext.prototype.getSVG = function () {
            return this.g;
        };
        SVG2DContext.counter = 0;
        return SVG2DContext;
    }(Core.Object));
    Core.SVG2DContext = SVG2DContext;
})(Core || (Core = {}));
if (Core.Navigator.supportCanvas) {
    CanvasRenderingContext2D.prototype['roundRect'] = Core.SVG2DPath.prototype.roundRect;
    CanvasRenderingContext2D.prototype['svgPath'] = Core.SVG2DContext.prototype.svgPath;
    CanvasRenderingContext2D.prototype['roundRectFilledShadow'] = Core.SVG2DContext.prototype.roundRectFilledShadow;
}
var Ui;
(function (Ui) {
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(init) {
            var _this = _super.call(this) || this;
            _this._fill = undefined;
            _this._radiusTopLeft = 0;
            _this._radiusTopRight = 0;
            _this._radiusBottomLeft = 0;
            _this._radiusBottomRight = 0;
            _this._fill = new Ui.Color(0, 0, 0);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Rectangle.prototype, "fill", {
            set: function (fill) {
                if (this._fill !== fill) {
                    if (typeof (fill) === 'string')
                        fill = Ui.Color.create(fill);
                    this._fill = fill;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "radius", {
            set: function (radius) {
                this.radiusTopLeft = radius;
                this.radiusTopRight = radius;
                this.radiusBottomLeft = radius;
                this.radiusBottomRight = radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "radiusTopLeft", {
            get: function () {
                return this._radiusTopLeft;
            },
            set: function (radiusTopLeft) {
                if (this._radiusTopLeft != radiusTopLeft) {
                    this._radiusTopLeft = radiusTopLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "radiusTopRight", {
            get: function () {
                return this._radiusTopRight;
            },
            set: function (radiusTopRight) {
                if (this._radiusTopRight != radiusTopRight) {
                    this._radiusTopRight = radiusTopRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "radiusBottomLeft", {
            get: function () {
                return this._radiusBottomLeft;
            },
            set: function (radiusBottomLeft) {
                if (this._radiusBottomLeft != radiusBottomLeft) {
                    this._radiusBottomLeft = radiusBottomLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "radiusBottomRight", {
            get: function () {
                return this._radiusBottomRight;
            },
            set: function (radiusBottomRight) {
                if (this._radiusBottomRight != radiusBottomRight) {
                    this._radiusBottomRight = radiusBottomRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Rectangle.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var topLeft = this._radiusTopLeft;
            var topRight = this._radiusTopRight;
            if (topLeft + topRight > w) {
                topLeft = w / 2;
                topRight = w / 2;
            }
            var bottomLeft = this._radiusBottomLeft;
            var bottomRight = this._radiusBottomRight;
            if (bottomLeft + bottomRight > w) {
                bottomLeft = w / 2;
                bottomRight = w / 2;
            }
            if (topLeft + bottomLeft > h) {
                topLeft = h / 2;
                bottomLeft = h / 2;
            }
            if (topRight + bottomRight > h) {
                topRight = h / 2;
                bottomRight = h / 2;
            }
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, topLeft, topRight, bottomRight, bottomLeft);
            ctx.closePath();
            if (this._fill instanceof Ui.Color)
                ctx.fillStyle = this._fill.getCssRgba();
            else if (this._fill instanceof Ui.LinearGradient)
                ctx.fillStyle = this._fill.getCanvasGradient(ctx, w, h);
            ctx.fill();
        };
        return Rectangle;
    }(Ui.CanvasElement));
    Ui.Rectangle = Rectangle;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Separator = (function (_super) {
        __extends(Separator, _super);
        function Separator() {
            var _this = _super.call(this) || this;
            _this.height = 1;
            _this.width = 1;
            return _this;
        }
        Separator.prototype.onStyleChange = function () {
            this.fill = this.getStyleProperty('color');
        };
        Separator.style = {
            color: '#444444'
        };
        return Separator;
    }(Ui.Rectangle));
    Ui.Separator = Separator;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Shape = (function (_super) {
        __extends(Shape, _super);
        function Shape(init) {
            var _this = _super.call(this) || this;
            _this._fill = undefined;
            _this._path = undefined;
            _this._scale = 1;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Shape.prototype, "scale", {
            set: function (scale) {
                if (this._scale != scale) {
                    this._scale = scale;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "fill", {
            get: function () {
                if (this._fill === undefined)
                    return Ui.Color.create(this.getStyleProperty('color'));
                else
                    return this._fill;
            },
            set: function (fill) {
                if (this._fill !== fill) {
                    if (typeof (fill) === 'string')
                        fill = Ui.Color.create(fill);
                    this._fill = fill;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "path", {
            set: function (path) {
                if (this._path != path) {
                    this._path = path;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Shape.prototype.onStyleChange = function () {
            this.invalidateDraw();
        };
        Shape.prototype.updateCanvas = function (ctx) {
            if (this._path === undefined)
                return;
            if (this._scale != 1)
                ctx.scale(this._scale, this._scale);
            ctx.svgPath(this._path);
            var fill = this.fill;
            if (fill instanceof Ui.Color)
                ctx.fillStyle = fill.getCssRgba();
            else if (fill instanceof Ui.LinearGradient)
                ctx.fillStyle = fill.getCanvasGradient(ctx, this.layoutWidth, this.layoutHeight);
            ctx.fill();
        };
        Shape.style = {
            color: '#444444'
        };
        return Shape;
    }(Ui.CanvasElement));
    Ui.Shape = Shape;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Icon = (function (_super) {
        __extends(Icon, _super);
        function Icon(init) {
            var _this = _super.call(this) || this;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Icon.prototype, "icon", {
            set: function (icon) {
                this.path = Icon.icons[icon];
            },
            enumerable: true,
            configurable: true
        });
        Icon.prototype.arrangeCore = function (width, height) {
            _super.prototype.arrangeCore.call(this, width, height);
            this.scale = Math.min(width, height) / 48;
        };
        Icon.initialize = function () {
            this.register('check', 'M18 32.3L9.7 24l-2.8 2.8L18 38 42 14l-2.8-2.8z');
            this.register('home', 'm24 6-20 18 6 0 0 16 10 0 0-12 8 0 0 12 10 0 0-16 6 0z');
            this.register('search', 'M16.6 2.8C9.3 2.8 3.3 8.7 3.3 16 3.3 23.3 9.3 29.3 16.6 29.3 19.2 29.3 21.7 28.5 23.8 27.1L26.5 29.8C26 31.2 26.4 32.9 27.5 34L37 43.5C38.5 45.1 41.1 45.1 42.6 43.5L44.3 41.8C45.9 40.3 45.9 37.8 44.3 36.2L34.8 26.7C33.7 25.6 32.3 25.3 30.9 25.7L28 22.7C29.2 20.8 29.8 18.5 29.8 16 29.8 8.7 23.9 2.8 16.6 2.8zM16.6 6.8C21.7 6.8 25.8 10.9 25.8 16 25.8 21.2 21.7 25.3 16.6 25.3 11.4 25.3 7.3 21.2 7.3 16 7.3 10.9 11.4 6.8 16.6 6.8z');
            this.register('close', 'M38 12.82L35.18 10 24 21.18 12.82 10 10 12.82 21.18 24 10 35.18 12.82 38 24 26.82 35.18 38 38 35.18 26.82 24z');
            this.register('backarrow', 'M40 22H15.86l11.18-11.18L24 8l-16 16 16 16 2.82-2.82L15.66 26H40v-4z');
            this.register('arrowleft', 'm30 4 5 5-15 15 15 15-5 5-20-20z');
            this.register('arrowright', 'm18 4-5 5 15 15-15 15 5 5 20-20z');
            this.register('arrowtop', 'm44 31-5 5-15-15-15 15-5-5 20-20z');
            this.register('arrowbottom', 'm4 16 5-5 15 15 15-15 5 5-20 20z');
            this.register('refresh', 'M24 8C15.2 8 8 15.2 8 24 8 32.8 15.2 40 24 40 31.5 40 37.7 34.9 39.5 28l-4.2 0C33.7 32.7 29.2 36 24 36 17.4 36 12 30.6 12 24c0-6.6 5.4-12 12-12 3.3 0 6.3 1.4 8.4 3.6L26 22 40 22 40 8 35.3 12.7C32.4 9.8 28.4 8 24 8Z');
            this.register('deny', 'M24.4 4.6C13.8 4.6 5.3 13.1 5.3 23.6 5.3 34.2 13.8 42.7 24.4 42.7 34.9 42.7 43.4 34.2 43.4 23.6 43.4 13.1 34.9 4.6 24.4 4.6zM12.9 20.5L36.4 20.5 36.4 27.8 12.9 27.8 12.9 20.5z');
            this.register('warning', 'M2 42h44L24 4 2 42zm24-6h-4v-4h4v4zm0-8h-4v-8h4v8z');
            this.register('trash', 'm12 38 c0 2 1.8 4 4 4l16 0c2.2 0 4-1.8 4-4L36 14 11.6 14ZM38 8 31 8 29 6 19 6 17 8 10 8 10 12 38 12Z');
            this.register('new', 'M38 6H10c-2.22 0-4 1.8-4 4v28c0 2.2 2.78 4 4 4h28c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4zm-4 20h-8v8h-4v-8H14v-4h8V14h4v8h8v4z');
            this.register('star', 'M24 34.54L36.36 42l-3.28-14.06L44 18.48l-14.38-1.22L24 4 18.38 17.26 4 18.48l10.92 9.46L11.64 42z');
            this.register('exit', 'M20.18 31.18L23 34l10-10-10-10-2.82 2.82L25.34 22H6v4h19.34l-5.16 5.18zM38 6H10c-2.22 0-4 1.8-4 4v4h4V10h28v28H10v-8H6v8c0 2.2 1.78 4 4 4h28c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4z');
            this.register('loading', 'M24 2.5C22.1 2.5 20.5 4.1 20.5 6 20.5 7.9 22.1 9.5 24 9.5 25.9 9.5 27.5 7.9 27.5 6 27.5 4.1 25.9 2.5 24 2.5zM11.3 7.8C10.4 7.8 9.5 8.1 8.8 8.8 7.5 10.2 7.5 12.4 8.8 13.8 10.2 15.1 12.4 15.1 13.8 13.8 15.1 12.4 15.1 10.2 13.8 8.8 13.1 8.1 12.2 7.8 11.3 7.8zM36.7 7.8C35.8 7.8 34.9 8.1 34.3 8.8 32.9 10.2 32.9 12.4 34.3 13.8 35.6 15.1 37.8 15.1 39.2 13.8 40.5 12.4 40.5 10.2 39.2 8.8 38.5 8.1 37.6 7.8 36.7 7.8zM6 20.5C4.1 20.5 2.5 22.1 2.5 24 2.5 25.9 4.1 27.5 6 27.5 7.9 27.5 9.5 25.9 9.5 24 9.5 22.1 7.9 20.5 6 20.5zM42 20.5C40.1 20.5 38.5 22.1 38.5 24 38.5 25.9 40.1 27.5 42 27.5 43.9 27.5 45.5 25.9 45.5 24 45.5 22.1 43.9 20.5 42 20.5zM11.3 33.3C10.4 33.3 9.5 33.6 8.8 34.3 7.5 35.6 7.5 37.8 8.8 39.2 10.2 40.5 12.4 40.5 13.8 39.2 15.1 37.8 15.1 35.6 13.8 34.3 13.1 33.6 12.2 33.3 11.3 33.3zM36.7 33.3C35.8 33.3 34.9 33.6 34.3 34.3 32.9 35.6 32.9 37.8 34.3 39.2 35.6 40.5 37.8 40.5 39.2 39.2 40.5 37.8 40.5 35.6 39.2 34.3 38.5 33.6 37.6 33.3 36.7 33.3zM24 38.5C22.1 38.5 20.5 40.1 20.5 42 20.5 43.9 22.1 45.5 24 45.5 25.9 45.5 27.5 43.9 27.5 42 27.5 40.1 25.9 38.5 24 38.5z');
            this.register('edit', 'M6 34.5V42h7.5L35.62 19.88l-7.5-7.5L6 35.5zM41.42 14.08c.78-.78.78-2.04 0-2.82l-4.68-4.68c-.78-.78-2.04-.78-2.82 0l-3.66 3.66 7.5 7.5 3.66-3.66z');
            this.register('upload', 'M18 32h12v-12h8l-14-14-14 14h8zm-8 18h28v4H10z');
            this.register('lock', 'M24 2C18.5 2 14 6.5 14 12l0 4-2 0c-2.2 0-4 1.8-4 4l0 20c0 2.2 1.8 4 4 4l24 0c2.2 0 4-1.8 4-4 0-10.5 0-11.2 0-20 0-2.2-1.8-4-4-4l-2 0 0-4C34 6.5 29.5 2 24 2Zm0 3.8C27.4 5.8 30.2 8.6 30.2 12l0 4-12.4 0 0-4C17.8 8.6 20.6 5.8 24 5.8ZM24 26c2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-2.2 0-4-1.8-4-4 0-2.2 1.8-4 4-4z');
            this.register('savecloud', 'M38.7 20.08C37.34 13.18 31.28 8 24 8 18.22 8 13.2 11.28 10.7 16.08 2.68 16.72 0 21.82 0 28c0 6.62 5.28 12 12 12h26c5.52 0 10-4.48 10-10 0-5.28-4.1-9.56-9.3-9.92zM28 26v8h-8v-8H14l10-10 10 10h-6z');
            this.register('calendar', 'M34 24h-10v10h10v-10zM32 2v4H16V2H12v4H10c-2.22 0-3.98 1.8-3.98 4L6 38c0 2.2 1.78 4 4 4h28c2.2 0 2-1.8 4-4V10c0-2.2-1.8-4-4-4h-2V2h-4zm6 36H10V16h28v22z');
            this.register('phone', 'M13.2 21.6c2.9 5.7 7.5 10.3 13.2 13.2l4.4-4.4c.5-.5 1.3-.7 2-.5 2.2 .7 4.7 1.1 7.1 1.1 1.1 0 2 .9 2 2V40c0 1.1-.9 2-2 2-18.8 0-34-15.2-34-34 0-1.1 .9-2 2-2h7c1.1 0 2 .9 2 2 0 2.5 .4 4.9 1.1 7.1 .2 .7 .1 1.5-.5 2l-4.4 4.4z');
            this.register('mail', 'M40 8H8c-2.2 0-4 1.8-4 4L4 36c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm0 8l-16 10-16-10V12l16 10 16-10v4z');
            this.register('plus', 'M38 26h-12v12h-4v-12H10v-4h12V10h4v12h12v4z');
            this.register('eye', 'M24.2 10.4C11.7 10.4 2 23.6 1.6 24.2L.9 25.1 1.6 26.1C2 26.7 11.7 39.9 24.2 39.9 36.6 39.9 46.3 26.7 46.7 26.1L47.4 25.1 46.7 24.2C46.3 23.6 36.6 10.4 24.2 10.4zM24.2 13.7C33.1 13.7 40.9 22.2 43.3 25.1 41 28 33.1 36.6 24.2 36.6 15.2 36.6 7.4 28 5 25.1 7.4 22.2 15.2 13.7 24.2 13.7zM24.8 15.2C19.4 15.2 15 19.6 15 24.9 15 30.3 19.4 34.7 24.8 34.7 30.2 34.7 34.6 30.3 34.6 24.9 34.6 23.1 34.1 21.5 33.3 20 33.1 22.1 31.4 23.8 29.3 23.8 27 23.8 25.3 22 25.3 19.8 25.3 17.9 26.7 16.3 28.5 15.9 27.4 15.5 26.1 15.2 24.8 15.2z');
            this.register('map', 'M41 6l-.3 .1L30 10.2 18 6 6.7 9.8c-.4 .1-.7 .5-.7 1V41c0 .6 .4 1 1 1l.3-.1L18 37.8l12 4.2 11.3-3.8c.4-.1 .7-.5 .7-1V7c0-.6-.4-1-1-1zM30 38l-12-4.2V10l12 4.2V38z');
            this.register('sortarrow', 'm4 32 40 0-20-20z');
            this.register('dragcopy', 'M24 .2C10.8 .2 .2 10.8 .2 24 .2 37.2 10.8 47.8 24 47.8 37.2 47.8 47.8 37.2 47.8 24 47.8 10.8 37.2 .2 24 .2zm-4.5 5.9 8.9 0 0 13.5 13.5 0 0 8.9-13.5 0 0 13.5-8.9 0 0-13.6-13.5 .1 0-8.9 13.5 0z');
            this.register('dragmove', 'M24 .2C10.8 .2 .2 10.8 .2 24 .2 37.2 10.8 47.8 24 47.8 37.2 47.8 47.8 37.2 47.8 24 47.8 10.8 37.2 .2 24 .2zM26.6 8.6L42 24 26.6 39.4 21.4 34.3 26.6 29.2 6 29.2 6 18.8 26.6 18.8 21.4 13.8 26.6 8.6z');
            this.register('draglink', 'M24 .2C10.8 .2 .2 10.8 .2 24 .2 37.2 10.8 47.8 24 47.8 37.2 47.8 47.8 37.2 47.8 24 47.8 10.8 37.2 .2 24 .2zM34.9 13.9C40.7 13.9 44.3 18.3 44.3 23.9 44.3 29.6 40.8 34.1 34.8 34.1 30.2 34.1 26.9 31.1 24 27.8 21 31.1 18.1 34.1 13.3 34.1 7.4 34.1 3.7 29.7 3.7 24 3.7 18.4 7.2 13.9 13.1 13.9 17.9 13.9 21.1 17.2 24 20.6 26.9 17.2 30.1 13.9 34.9 13.9zM34.8 19.3C31.9 19.3 29.1 22.1 27.2 24.1 29.2 26.3 31.8 28.7 34.9 28.7 37.7 28.7 39.3 26.7 39.3 24.1 39.3 21.4 37.6 19.3 34.8 19.3zM13.1 19.3C10.4 19.3 8.8 21.6 8.8 24.1 8.8 26.8 10.5 28.7 13.2 28.7 16.1 28.7 19 26.1 20.8 24.1 18.9 22.2 15.9 19.3 13.1 19.3z');
            this.register('dragchoose', 'M24 .2C10.8 .2 .2 10.8 .2 24 .2 37.2 10.8 47.8 24 47.8 37.2 47.8 47.8 37.2 47.8 24 47.8 10.8 37.2 .2 24 .2zM23.6 3.3L25.9 3.3C33.1 3.3 37.8 8 37.8 14.7 37.8 22.1 33.3 24 29.7 25.6 27.7 26.6 26 27.4 26 29.8 26 31.4 26.4 32.3 26.4 32.8 26.4 33.2 26.2 33.3 25.8 33.3L19.7 33.3C19.3 33.3 19.1 33.1 19 32.8 18.8 31.6 18.6 30.2 18.6 28.9 18.6 23 22.8 21.3 26.3 19.5 28.5 18.4 30.4 17.3 30.4 14.7 30.4 12.1 28.4 10.1 25.9 10.1L23.6 10.1C21.8 10.1 20.2 11.1 19 13.8 18.9 14.2 18.7 14.3 18.5 14.3 18.2 14.3 18 14.1 17.8 14L12.6 11.3C12.4 11.2 12.2 11.1 12.2 10.9 12.2 10.5 12.9 9.5 13.4 8.5 15.4 5.5 18.3 3.3 23.6 3.3zM23.4 36.4C25.7 36.4 27.7 38.4 27.7 40.7 27.7 43 25.7 44.9 23.4 44.9 21.1 44.9 19.1 43 19.1 40.7 19.1 38.4 21.1 36.4 23.4 36.4z');
            this.register('dragrun', 'M24 2.4C12.1 2.4 2.4 12.1 2.4 24 2.4 36 12.1 45.6 24 45.6 36 45.6 45.6 36 45.6 24 45.6 12.1 36 2.4 24 2.4zM23.9 7.8C24 7.8 24 7.8 24 7.8 27 7.8 29.8 8.6 32.2 10L30.4 13.1C32.3 14.2 33.8 15.7 34.9 17.6L38 15.8C39.4 18.2 40.3 21 40.3 24 40.3 24 40.3 24 40.3 24.1L36.7 24C36.7 26.3 36.1 28.4 35 30.3L38.1 32.1C36.7 34.6 34.6 36.7 32.1 38.1L30.3 35C28.4 36.1 26.3 36.7 24 36.7L24.1 40.3C24 40.3 24 40.3 24 40.3 21 40.3 18.2 39.4 15.8 38L17.6 34.9C15.7 33.8 14.2 32.3 13.1 30.4L10 32.2C8.6 29.8 7.8 27 7.8 24 7.8 24 7.8 24 7.8 23.9L11.3 24C11.3 21.7 12 19.6 13 17.7L9.9 15.9C11.3 13.4 13.4 11.3 15.9 9.9L17.7 13C19.6 12 21.7 11.3 24 11.3L23.9 7.8zM24 18.8C21.1 18.8 18.8 21.1 18.8 24 18.8 26.9 21.1 29.2 24 29.2 26.9 29.2 29.2 26.9 29.2 24 29.2 21.1 26.9 18.8 24 18.8z');
            this.register('dragplay', 'M24 .2C10.8 .2 .2 10.8 .2 24 .2 37.2 10.8 47.8 24 47.8 37.2 47.8 47.8 37.2 47.8 24 47.8 10.8 37.2 .2 24 .2zM13.8 7.8L42.2 24 13.8 40.3 13.8 7.8z');
        };
        Icon.getPath = function (icon) {
            return Icon.icons[icon];
        };
        Icon.getNames = function () {
            var names = [];
            for (var tmp in Icon.icons)
                names.push(tmp);
            return names;
        };
        Icon.register = function (iconName, iconPath) {
            if (Icon.icons[iconName] !== undefined)
                throw ('Icon \'' + iconName + '\' is already registered. To change it, use override');
            Icon.icons[iconName] = iconPath;
        };
        Icon.override = function (iconName, iconPath) {
            Icon.icons[iconName] = iconPath;
        };
        Icon.parse = function (icon) {
            var ico = new Ui.Icon();
            ico.icon = icon;
            return ico;
        };
        Icon.drawIcon = function (ctx, icon, size, fill) {
            ctx.save();
            var scale = size / 48;
            ctx.scale(scale, scale);
            ctx.svgPath(Icon.getPath(icon));
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.restore();
        };
        Icon.drawIconAndBadge = function (ctx, icon, size, fill, badgeText, badgeSize, badgeFill, textFill) {
            ctx.save();
            var scale = size / 48;
            badgeSize /= scale;
            var textHeight = badgeSize * 0.75;
            ctx.font = 'bold ' + textHeight + 'px sans-serif';
            var textSize = ctx.measureText(badgeText);
            var textWidth = textSize.width;
            var badgeWidth = Math.max(badgeSize, textWidth * 1.25);
            ctx.scale(scale, scale);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, 48, 48);
            ctx.roundRect(1, 48 - 5 - badgeSize, badgeWidth + 4, badgeSize + 4, badgeSize / 2, badgeSize / 2, badgeSize / 2, badgeSize / 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.svgPath(Ui.Icon.getPath(icon));
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = badgeFill;
            ctx.beginPath();
            ctx.roundRect(3, 48 - 3 - badgeSize, badgeWidth, badgeSize, badgeSize / 2, badgeSize / 2, badgeSize / 2, badgeSize / 2);
            ctx.closePath();
            ctx.fill();
            ctx.textBaseline = 'middle';
            ctx.fillStyle = textFill;
            ctx.fillText(badgeText, 3 + ((badgeWidth - textWidth) / 2), 48 - (3 + (badgeSize / 2)));
            ctx.restore();
        };
        Icon.icons = {};
        return Icon;
    }(Ui.Shape));
    Ui.Icon = Icon;
})(Ui || (Ui = {}));
Ui.Icon.initialize();
var Ui;
(function (Ui) {
    var DualIcon = (function (_super) {
        __extends(DualIcon, _super);
        function DualIcon() {
            var _this = _super.call(this) || this;
            _this._icon = undefined;
            _this._fill = undefined;
            _this._stroke = undefined;
            _this._strokeWidth = undefined;
            return _this;
        }
        Object.defineProperty(DualIcon.prototype, "icon", {
            set: function (icon) {
                this._icon = icon;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DualIcon.prototype, "fill", {
            get: function () {
                if (this._fill === undefined)
                    return Ui.Color.create(this.getStyleProperty('fill'));
                else
                    return this._fill;
            },
            set: function (fill) {
                this._fill = fill;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DualIcon.prototype, "stroke", {
            get: function () {
                if (this._stroke === undefined)
                    return Ui.Color.create(this.getStyleProperty('stroke'));
                else
                    return this._stroke;
            },
            set: function (stroke) {
                this._stroke = stroke;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DualIcon.prototype, "strokeWidth", {
            get: function () {
                if (this._strokeWidth === undefined)
                    return this.getStyleProperty('strokeWidth');
                else
                    return this._strokeWidth;
            },
            set: function (strokeWidth) {
                this._strokeWidth = strokeWidth;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        DualIcon.prototype.updateCanvas = function (ctx) {
            var strokeWidth = this.strokeWidth;
            ctx.save();
            var scale = Math.min(this.layoutWidth, this.layoutHeight) / 48;
            ctx.scale(scale, scale);
            ctx.translate(strokeWidth, strokeWidth);
            var scale2 = (48 - (strokeWidth * 2)) / 48;
            ctx.scale(scale2, scale2);
            var path = Ui.Icon.getPath(this._icon);
            if (path == undefined)
                throw "Icon '" + this._icon + "' NOT AVAILABLE for DualIcon";
            ctx.svgPath(path);
            ctx.strokeStyle = this.stroke.getCssRgba();
            ctx.lineWidth = strokeWidth * 2;
            ctx.stroke();
            ctx.fillStyle = this.fill.getCssRgba();
            ctx.fill();
            ctx.restore();
        };
        DualIcon.style = {
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2
        };
        return DualIcon;
    }(Ui.CanvasElement));
    Ui.DualIcon = DualIcon;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Event = (function (_super) {
        __extends(Event, _super);
        function Event() {
            var _this = _super.call(this) || this;
            _this.type = undefined;
            _this.bubbles = true;
            _this.cancelable = true;
            _this.target = undefined;
            _this.cancelBubble = false;
            _this.stop = false;
            return _this;
        }
        Event.prototype.stopPropagation = function () {
            this.cancelBubble = true;
        };
        Event.prototype.stopImmediatePropagation = function () {
            this.stop = true;
        };
        Event.prototype.getIsPropagationStopped = function () {
            return this.stop || this.cancelBubble;
        };
        Event.prototype.setType = function (type) {
            this.type = type;
        };
        Event.prototype.setBubbles = function (bubbles) {
            this.bubbles = bubbles;
        };
        Event.prototype.dispatchEvent = function (target) {
            this.target = target;
            if (this.bubbles) {
                var stack = [];
                var current = this.target;
                while (current != undefined) {
                    stack.push(current);
                    current = current.parent;
                }
                for (var i = stack.length - 1; (i >= 0) && (!this.cancelBubble) && (!this.stop); i--) {
                    current = stack[i];
                    var handlers = current.getEventHandlers(this.type);
                    for (var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
                        var handler = handlers[i2];
                        if (handler.capture)
                            handler.method.apply(handler.scope, [this]);
                    }
                }
                for (var i = 0; (i < stack.length) && (!this.cancelBubble) && (!this.stop); i++) {
                    current = stack[i];
                    var handlers = current.getEventHandlers(this.type);
                    for (var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
                        var handler = handlers[i2];
                        if (!handler.capture)
                            handler.method.apply(handler.scope, [this]);
                    }
                }
            }
            else {
                var handlers = this.target.getEventHandlers(this.type);
                for (var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
                    var handler = handlers[i2];
                    if (handler.capture)
                        handler.method.apply(handler.scope, [this]);
                }
                for (var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
                    var handler = handlers[i2];
                    if (!handler.capture)
                        handler.method.apply(handler.scope, [this]);
                }
            }
        };
        return Event;
    }(Core.Object));
    Ui.Event = Event;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var PointerEvent = (function (_super) {
        __extends(PointerEvent, _super);
        function PointerEvent(type, pointer) {
            var _this = _super.call(this) || this;
            _this.pointer = undefined;
            _this.clientX = 0;
            _this.clientY = 0;
            _this.pointerType = 'mouse';
            _this.setType(type);
            _this.pointer = pointer;
            _this.clientX = _this.pointer.getX();
            _this.clientY = _this.pointer.getY();
            _this.pointerType = _this.pointer.getType();
            return _this;
        }
        return PointerEvent;
    }(Ui.Event));
    Ui.PointerEvent = PointerEvent;
    var PointerWatcher = (function (_super) {
        __extends(PointerWatcher, _super);
        function PointerWatcher(element, pointer) {
            var _this = _super.call(this) || this;
            _this.addEvents('down', 'move', 'up', 'cancel');
            _this.element = element;
            _this.pointer = pointer;
            return _this;
        }
        PointerWatcher.prototype.getAbsoluteDelta = function () {
            var initial = { x: this.pointer.getInitialX(), y: this.pointer.getInitialY() };
            var current = { x: this.pointer.getX(), y: this.pointer.getY() };
            return { x: current.x - initial.x, y: current.y - initial.y };
        };
        PointerWatcher.prototype.getDelta = function () {
            var initial = new Ui.Point(this.pointer.getInitialX(), this.pointer.getInitialY());
            var current = new Ui.Point(this.pointer.getX(), this.pointer.getY());
            initial = this.element.pointFromWindow(initial);
            current = this.element.pointFromWindow(current);
            return { x: current.x - initial.x, y: current.y - initial.y };
        };
        PointerWatcher.prototype.getPosition = function () {
            var current = new Ui.Point(this.pointer.getX(), this.pointer.getY());
            return this.element.pointFromWindow(current);
        };
        PointerWatcher.prototype.getIsInside = function () {
            var pos = this.getPosition();
            if ((pos.x >= 0) && (pos.x <= this.element.layoutWidth) &&
                (pos.y >= 0) && (pos.y <= this.element.layoutHeight))
                return true;
            return false;
        };
        PointerWatcher.prototype.getDirection = function () {
            var delta = this.getDelta();
            if (Math.abs(delta.x) > Math.abs(delta.y)) {
                if (delta.x < 0)
                    return 'left';
                else
                    return 'right';
            }
            else {
                if (delta.y < 0)
                    return 'top';
                else
                    return 'bottom';
            }
        };
        PointerWatcher.prototype.getSpeed = function () {
            if ((this.pointer === undefined) || (this.pointer.history.length < 2))
                return { x: 0, y: 0 };
            else {
                var measure = void 0;
                var i = this.pointer.history.length;
                var now = { time: (new Date().getTime()) / 1000, x: this.pointer.x, y: this.pointer.y };
                do {
                    measure = this.pointer.history[--i];
                } while ((i > 0) && ((now.time - measure.time) < 0.08));
                var deltaTime = now.time - measure.time;
                return {
                    x: (now.x - measure.x) / deltaTime,
                    y: (now.y - measure.y) / deltaTime
                };
            }
        };
        PointerWatcher.prototype.getIsCaptured = function () {
            return (this.pointer !== undefined) && (this.pointer.captureWatcher === this);
        };
        PointerWatcher.prototype.capture = function () {
            this.pointer.capture(this);
        };
        PointerWatcher.prototype.release = function () {
            this.pointer.release(this);
        };
        PointerWatcher.prototype.cancel = function () {
            if (this.pointer != undefined) {
                this.fireEvent('cancel', this);
                this.pointer.unwatch(this);
                this.pointer = undefined;
            }
        };
        PointerWatcher.prototype.down = function () {
            if (this.pointer != undefined)
                this.fireEvent('down', this);
        };
        PointerWatcher.prototype.move = function () {
            if (this.pointer != undefined)
                this.fireEvent('move', this);
        };
        PointerWatcher.prototype.up = function () {
            if (this.pointer != undefined)
                this.fireEvent('up', this);
        };
        PointerWatcher.prototype.unwatch = function () {
            if (this.pointer != undefined)
                this.pointer.unwatch(this);
        };
        return PointerWatcher;
    }(Core.Object));
    Ui.PointerWatcher = PointerWatcher;
    var Pointer = (function (_super) {
        __extends(Pointer, _super);
        function Pointer(type, id) {
            var _this = _super.call(this) || this;
            _this.id = undefined;
            _this.x = 0;
            _this.y = 0;
            _this.initialX = 0;
            _this.initialY = 0;
            _this.altKey = false;
            _this.ctrlKey = false;
            _this.shiftKey = false;
            _this.type = undefined;
            _this.start = undefined;
            _this.cumulMove = 0;
            _this.chainLevel = 0;
            _this.watchers = undefined;
            _this.captureWatcher = undefined;
            _this.history = undefined;
            _this.buttons = 0;
            _this.addEvents('ptrmove', 'ptrup', 'ptrcancel');
            _this.type = type;
            _this.id = id;
            _this.start = (new Date().getTime()) / 1000;
            _this.watchers = [];
            _this.history = [];
            return _this;
        }
        Pointer.prototype.capture = function (watcher) {
            var watchers = this.watchers.slice();
            for (var i = 0; i < watchers.length; i++) {
                if (watchers[i] !== watcher)
                    watchers[i].cancel();
            }
            this.captureWatcher = watcher;
        };
        Pointer.prototype.release = function (watcher) {
            this.captureWatcher = undefined;
        };
        Pointer.prototype.getType = function () {
            return this.type;
        };
        Pointer.prototype.getIsDown = function () {
            return this.buttons !== 0;
        };
        Pointer.prototype.getIsCaptured = function () {
            return (this.captureWatcher !== undefined);
        };
        Pointer.prototype.getX = function () {
            return this.x;
        };
        Pointer.prototype.getY = function () {
            return this.y;
        };
        Pointer.prototype.getInitialX = function () {
            return this.initialX;
        };
        Pointer.prototype.getInitialY = function () {
            return this.initialY;
        };
        Pointer.prototype.setInitialPosition = function (x, y) {
            this.initialX = x;
            this.initialY = y;
        };
        Pointer.prototype.getButtons = function () {
            return this.buttons;
        };
        Pointer.prototype.setButtons = function (buttons) {
            this.buttons = buttons;
        };
        Pointer.prototype.getChainLevel = function () {
            return this.chainLevel;
        };
        Pointer.prototype.getAltKey = function () {
            return this.altKey;
        };
        Pointer.prototype.setAltKey = function (altKey) {
            this.altKey = altKey;
        };
        Pointer.prototype.getCtrlKey = function () {
            return this.ctrlKey;
        };
        Pointer.prototype.setCtrlKey = function (ctrlKey) {
            this.ctrlKey = ctrlKey;
        };
        Pointer.prototype.getShiftKey = function () {
            return this.shiftKey;
        };
        Pointer.prototype.setShiftKey = function (shiftKey) {
            this.shiftKey = shiftKey;
        };
        Pointer.prototype.setControls = function (altKey, ctrlKey, shiftKey) {
            this.altKey = altKey;
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
        };
        Pointer.prototype.move = function (x, y) {
            if (x === undefined)
                x = this.x;
            if (y === undefined)
                y = this.y;
            if ((this.x !== x) || (this.y !== y)) {
                var deltaX = this.x - x;
                var deltaY = this.y - y;
                this.cumulMove += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                this.x = x;
                this.y = y;
                var time = (new Date().getTime()) / 1000;
                this.history.push({ time: time, x: this.x, y: this.y });
                while ((this.history.length > 2) && (time - this.history[0].time > Ui.Pointer.HISTORY_TIMELAPS)) {
                    this.history.shift();
                }
            }
            var watchers = this.watchers.slice();
            for (var i = 0; i < watchers.length; i++)
                watchers[i].move();
            if (this.captureWatcher === undefined) {
                var target = Ui.App.current.elementFromPoint(new Ui.Point(this.x, this.y));
                if (target != undefined) {
                    var pointerEvent = new PointerEvent('ptrmove', this);
                    this.fireEvent('ptrmove', pointerEvent);
                    pointerEvent.dispatchEvent(target);
                }
            }
        };
        Pointer.prototype.getIsHold = function () {
            return (((new Date().getTime()) / 1000) - this.start) >= Ui.Pointer.HOLD_DELAY;
        };
        Pointer.prototype.getDelta = function () {
            var deltaX = this.x - this.initialX;
            var deltaY = this.y - this.initialY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        };
        Pointer.prototype.getCumulMove = function () {
            return this.cumulMove;
        };
        Pointer.prototype.getIsMove = function () {
            return this.cumulMove >= Pointer.MOVE_DELTA;
        };
        Pointer.prototype.down = function (x, y, buttons) {
            this.start = (new Date().getTime()) / 1000;
            this.x = x;
            this.initialX = x;
            this.y = y;
            this.initialY = y;
            this.history = [];
            this.history.push({ time: this.start, x: this.initialX, y: this.initialY });
            this.buttons = buttons;
            this.cumulMove = 0;
            var watchers = this.watchers.slice();
            for (var i = 0; i < watchers.length; i++)
                watchers[i].down();
            var target = Ui.App.current.elementFromPoint(new Ui.Point(this.x, this.y));
            if (target !== undefined) {
                var pointerEvent = new Ui.PointerEvent('ptrdown', this);
                pointerEvent.dispatchEvent(target);
            }
        };
        Pointer.prototype.up = function () {
            var watchers = this.watchers.slice();
            for (var i = 0; i < watchers.length; i++)
                watchers[i].up();
            if (this.type == 'touch')
                this.watchers = [];
            this.buttons = 0;
            if (this.captureWatcher === undefined) {
                var target = Ui.App.current.elementFromPoint(new Ui.Point(this.x, this.y));
                if (target != undefined) {
                    var pointerEvent = new PointerEvent('ptrup', this);
                    this.fireEvent('ptrup', pointerEvent);
                    pointerEvent.dispatchEvent(target);
                }
            }
            this.captureWatcher = undefined;
        };
        Pointer.prototype.watch = function (element) {
            var watcher = new Ui.PointerWatcher(element, this);
            this.watchers.push(watcher);
            return watcher;
        };
        Pointer.prototype.unwatch = function (watcher) {
            for (var i = 0; i < this.watchers.length; i++) {
                if (this.watchers[i] === watcher) {
                    this.watchers.splice(i, 1);
                    break;
                }
            }
        };
        Pointer.HOLD_DELAY = 0.75;
        Pointer.MOVE_DELTA = 15;
        Pointer.HISTORY_TIMELAPS = 0.5;
        return Pointer;
    }(Core.Object));
    Ui.Pointer = Pointer;
    var PointerManager = (function (_super) {
        __extends(PointerManager, _super);
        function PointerManager(app) {
            var _this = _super.call(this) || this;
            _this.touches = undefined;
            _this.lastUpdate = undefined;
            _this.lastTouchX = -1;
            _this.lastTouchY = -1;
            _this.lastDownTouchX = -1;
            _this.lastDownTouchY = -1;
            _this.mouse = undefined;
            _this.pointers = {};
            _this.app = app;
            if ('PointerEvent' in window) {
                _this.connect(window, 'pointerdown', _this.onPointerDown);
                _this.connect(window, 'pointermove', _this.onPointerMove);
                _this.connect(window, 'pointerup', _this.onPointerUp);
                _this.connect(window, 'pointercancel', _this.onPointerCancel);
            }
            else {
                _this.mouse = new Ui.Pointer('mouse', 0);
                _this.connect(window, 'mousedown', _this.onMouseDown);
                _this.connect(window, 'mousemove', _this.onMouseMove);
                _this.connect(window, 'mouseup', _this.onMouseUp);
                _this.connect(document, 'selectstart', _this.onSelectStart);
                _this.connect(window, 'keydown', function (event) {
                    if ((event.which === 16) || (event.which === 17) || (event.which === 18)) {
                        this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
                        this.mouse.move();
                    }
                });
                _this.connect(window, 'keyup', function (event) {
                    if ((event.which === 16) || (event.which === 17) || (event.which === 18)) {
                        this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
                        this.mouse.move();
                    }
                });
                _this.connect(document, 'contextmenu', function (event) {
                    if (this.mouse !== undefined) {
                        this.mouse.capture(undefined);
                        this.mouse.up();
                    }
                });
                _this.connect(document.body, 'touchstart', _this.updateTouches, true);
                _this.connect(document.body, 'touchmove', _this.updateTouches, true);
                _this.connect(document.body, 'touchend', _this.updateTouches, true);
                _this.connect(document.body, 'touchcancel', _this.updateTouches, true);
            }
            return _this;
        }
        PointerManager.prototype.onSelectStart = function (event) {
            if (this.mouse.getIsCaptured()) {
                event.preventDefault();
                return;
            }
            var selectable = false;
            var current = event.target;
            while (current != undefined) {
                if (current.selectable === true) {
                    selectable = true;
                    break;
                }
                current = current.parentNode;
            }
            if (!selectable)
                event.preventDefault();
            else if (this.mouse !== undefined)
                this.mouse.capture(undefined);
        };
        PointerManager.prototype.onMouseDown = function (event) {
            var deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
            var deltaX = (this.lastTouchX - event.clientX);
            var deltaY = (this.lastTouchY - event.clientY);
            var deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var downDeltaX = this.lastDownTouchX - event.clientX;
            var downDeltaY = this.lastDownTouchY - event.clientY;
            var downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);
            if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
                return;
            var buttons = 0;
            if (event.button === 0)
                buttons |= 1;
            else if (event.button === 1)
                buttons |= 2;
            else if (event.button === 2)
                buttons |= 4;
            this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
            var oldButtons = this.mouse.getButtons();
            if (oldButtons === 0)
                this.mouse.down(event.clientX, event.clientY, buttons);
            else
                this.mouse.setButtons(oldButtons | buttons);
        };
        PointerManager.prototype.onMouseMove = function (event) {
            this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
            var deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
            var deltaX = (this.lastTouchX - event.clientX);
            var deltaY = (this.lastTouchY - event.clientY);
            var deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var downDeltaX = this.lastDownTouchX - event.clientX;
            var downDeltaY = this.lastDownTouchY - event.clientY;
            var downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);
            if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
                return;
            this.mouse.move(event.clientX, event.clientY);
        };
        PointerManager.prototype.onMouseUp = function (event) {
            this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
            var deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
            var deltaX = (this.lastTouchX - event.clientX);
            var deltaY = (this.lastTouchY - event.clientY);
            var deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var downDeltaX = this.lastDownTouchX - event.clientX;
            var downDeltaY = this.lastDownTouchY - event.clientY;
            var downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);
            if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
                return;
            this.mouse.move(event.clientX, event.clientY);
            this.mouse.up();
        };
        PointerManager.prototype.onWindowLoad = function () {
            try {
                if (document.body === undefined) {
                    var htmlBody = document.createElement('body');
                    document.body = htmlBody;
                }
            }
            catch (e) { }
        };
        PointerManager.prototype.onPointerDown = function (event) {
            event.target.setPointerCapture(event.pointerId);
            if (this.pointers[event.pointerId] === undefined) {
                var type = void 0;
                if (event.pointerType === 'pen')
                    type = 'pen';
                else if (event.pointerType === 'mouse')
                    type = 'mouse';
                else
                    type = 'touch';
                var pointer = new Pointer(type, event.pointerId);
                this.pointers[event.pointerId] = pointer;
            }
            this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
            this.pointers[event.pointerId].down(event.clientX, event.clientY, 1);
        };
        PointerManager.prototype.onPointerMove = function (event) {
            if (this.pointers[event.pointerId] === undefined) {
                var type = void 0;
                if (event.pointerType === 'pen')
                    type = 'pen';
                else if (event.pointerType === 'mouse')
                    type = 'mouse';
                else
                    type = 'touch';
                var pointer = new Pointer(type, event.pointerId);
                this.pointers[event.pointerId] = pointer;
            }
            this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
            this.pointers[event.pointerId].move(event.clientX, event.clientY);
        };
        PointerManager.prototype.onPointerUp = function (event) {
            event.target.releasePointerCapture(event.pointerId);
            if (this.pointers[event.pointerId] !== undefined) {
                this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
                this.pointers[event.pointerId].up();
                if (this.pointers[event.pointerId].getType() == 'touch')
                    delete (this.pointers[event.pointerId]);
            }
        };
        PointerManager.prototype.onPointerCancel = function (event) {
        };
        PointerManager.prototype.updateTouches = function (event) {
            this.lastUpdate = (new Date().getTime()) / 1000;
            for (var id in this.pointers) {
                var found = false;
                for (var i = 0; (i < event.touches.length) && !found; i++) {
                    if (id == event.touches[i].identifier) {
                        found = true;
                        this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
                        this.pointers[id].move(event.touches[i].clientX, event.touches[i].clientY);
                    }
                }
                if (!found) {
                    this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
                    this.pointers[id].up();
                    delete (this.pointers[id]);
                }
            }
            for (var i = 0; i < event.touches.length; i++) {
                this.lastTouchX = event.touches[i].clientX;
                this.lastTouchY = event.touches[i].clientY;
                if (this.pointers[event.touches[i].identifier] == undefined) {
                    var pointer = new Ui.Pointer('touch', event.touches[i].identifier);
                    this.pointers[event.touches[i].identifier] = pointer;
                    pointer.setControls(event.altKey, event.ctrlKey, event.shiftKey);
                    pointer.down(event.touches[i].clientX, event.touches[i].clientY, 1);
                }
            }
            if (event.type === 'touchstart') {
                for (var i = 0; i < event.changedTouches.length; i++) {
                    this.lastDownTouchX = event.changedTouches[i].clientX;
                    this.lastDownTouchY = event.changedTouches[i].clientY;
                }
            }
            if (event.type === 'touchmove')
                event.preventDefault();
        };
        return PointerManager;
    }(Core.Object));
    Ui.PointerManager = PointerManager;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DragEffectIcon = (function (_super) {
        __extends(DragEffectIcon, _super);
        function DragEffectIcon() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DragEffectIcon.prototype.onStyleChange = function () {
            var size = this.getStyleProperty('size');
            this.width = size;
            this.height = size;
        };
        DragEffectIcon.style = {
            fill: '#333333',
            stroke: '#ffffff',
            strokeWidth: 4,
            size: 16
        };
        return DragEffectIcon;
    }(Ui.DualIcon));
    Ui.DragEffectIcon = DragEffectIcon;
    var DragEvent = (function (_super) {
        __extends(DragEvent, _super);
        function DragEvent() {
            var _this = _super.call(this) || this;
            _this.clientX = 0;
            _this.clientY = 0;
            _this.ctrlKey = false;
            _this.altKey = false;
            _this.shiftKey = false;
            _this.metaKey = false;
            _this.dataTransfer = undefined;
            _this.effectAllowed = undefined;
            _this.deltaX = 0;
            _this.deltaY = 0;
            return _this;
        }
        DragEvent.prototype.preventDefault = function () {
        };
        return DragEvent;
    }(Ui.Event));
    Ui.DragEvent = DragEvent;
    var DragNativeData = (function (_super) {
        __extends(DragNativeData, _super);
        function DragNativeData(dataTransfer) {
            var _this = _super.call(this) || this;
            _this.dataTransfer = undefined;
            _this.dataTransfer = dataTransfer;
            return _this;
        }
        DragNativeData.prototype.getTypes = function () {
            return this.dataTransfer.dataTransfer.types;
        };
        DragNativeData.prototype.hasTypes = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var types = this.getTypes();
            for (var i = 0; i < types.length; i++) {
                for (var i2 = 0; i2 < args.length; i2++)
                    if (types[i].toLowerCase() === args[i2].toLowerCase())
                        return true;
            }
            return false;
        };
        DragNativeData.prototype.hasType = function (type) {
            return this.hasTypes(type);
        };
        DragNativeData.prototype.hasFiles = function () {
            return this.hasType('files');
        };
        DragNativeData.prototype.getFiles = function () {
            var files = [];
            for (var i = 0; i < this.dataTransfer.dataTransfer.files.length; i++)
                files.push(new Core.File({ fileApi: this.dataTransfer.dataTransfer.files[i] }));
            return files;
        };
        DragNativeData.prototype.getData = function (type) {
            return this.dataTransfer.dataTransfer.getData(type);
        };
        return DragNativeData;
    }(Core.Object));
    Ui.DragNativeData = DragNativeData;
    var DragWatcher = (function (_super) {
        __extends(DragWatcher, _super);
        function DragWatcher(element, dataTransfer) {
            var _this = _super.call(this) || this;
            _this.effectAllowed = undefined;
            _this.dataTransfer = undefined;
            _this.x = 0;
            _this.y = 0;
            _this.addEvents('drop', 'leave', 'move');
            _this.dataTransfer = dataTransfer;
            _this.element = element;
            return _this;
        }
        DragWatcher.prototype.getPosition = function () {
            return new Ui.Point(this.x, this.y);
        };
        DragWatcher.prototype.getElement = function () {
            return this.element;
        };
        DragWatcher.prototype.getDataTransfer = function () {
            return this.dataTransfer;
        };
        DragWatcher.prototype.getEffectAllowed = function () {
            return this.effectAllowed;
        };
        DragWatcher.prototype.setEffectAllowed = function (effect) {
            this.effectAllowed = effect;
        };
        DragWatcher.prototype.move = function (x, y) {
            this.x = x;
            this.y = y;
            this.fireEvent('move', this, x, y);
        };
        DragWatcher.prototype.leave = function () {
            this.fireEvent('leave', this);
        };
        DragWatcher.prototype.drop = function (dropEffect) {
            this.fireEvent('drop', this, dropEffect, this.x, this.y);
        };
        DragWatcher.prototype.release = function () {
            this.dataTransfer.releaseDragWatcher(this);
        };
        return DragWatcher;
    }(Core.Object));
    Ui.DragWatcher = DragWatcher;
    var DragEmuDataTransfer = (function (_super) {
        __extends(DragEmuDataTransfer, _super);
        function DragEmuDataTransfer(draggable, x, y, delayed, pointer) {
            var _this = _super.call(this) || this;
            _this.image = undefined;
            _this.imageEffect = undefined;
            _this.catcher = undefined;
            _this.startX = 0;
            _this.startY = 0;
            _this.dropX = 0;
            _this.dropY = 0;
            _this.x = 0;
            _this.y = 0;
            _this.startImagePoint = undefined;
            _this.overElement = undefined;
            _this.hasStarted = false;
            _this.dragDelta = undefined;
            _this.effectAllowed = undefined;
            _this.watcher = undefined;
            _this.pointer = undefined;
            _this.dropEffect = undefined;
            _this.dropEffectIcon = undefined;
            _this.data = undefined;
            _this.timer = undefined;
            _this.dropFailsTimer = undefined;
            _this.delayed = false;
            _this.dragWatcher = undefined;
            _this.addEvents('start', 'end');
            _this.dropEffect = [];
            _this.effectAllowed = [];
            _this.draggable = draggable;
            _this.startX = x;
            _this.startY = y;
            _this.delayed = delayed;
            _this.pointer = pointer;
            _this.watcher = _this.pointer.watch(Ui.App.current);
            _this.dragDelta = _this.draggable.pointFromWindow(new Ui.Point(_this.startX, _this.startY));
            _this.data = {};
            _this.connect(_this.watcher, 'move', _this.onPointerMove);
            _this.connect(_this.watcher, 'up', _this.onPointerUp);
            _this.connect(_this.watcher, 'cancel', _this.onPointerCancel);
            if (_this.delayed)
                _this.timer = new Core.DelayedTask(_this, 0.5, _this.onTimer);
            return _this;
        }
        DragEmuDataTransfer.prototype.setData = function (data) {
            this.data = data;
        };
        DragEmuDataTransfer.prototype.getData = function () {
            return this.data;
        };
        DragEmuDataTransfer.prototype.hasData = function () {
            return this.data !== undefined;
        };
        DragEmuDataTransfer.prototype.getPosition = function () {
            return new Ui.Point(this.x, this.y);
        };
        DragEmuDataTransfer.prototype.getDragDelta = function () {
            return this.dragDelta;
        };
        DragEmuDataTransfer.prototype.generateImage = function (element) {
            var res;
            var key;
            var child;
            var i;
            if (('tagName' in element) && (element.tagName.toUpperCase() == 'IMG')) {
                res = element.cloneNode(false);
                res.oncontextmenu = function (e) { e.preventDefault(); };
            }
            else if (('tagName' in element) && (element.tagName.toUpperCase() == 'CANVAS')) {
                res = document.createElement('img');
                res.oncontextmenu = function (e) { e.preventDefault(); };
                for (key in element.style)
                    res.style[key] = element.style[key];
                res.setAttribute('src', element.toDataURL('image/png'));
            }
            else if (!Core.Navigator.isFirefox && (element.toDataURL !== undefined)) {
                res = document.createElement('img');
                res.oncontextmenu = function (e) { e.preventDefault(); };
                for (key in element.style)
                    res.style[key] = element.style[key];
                res.setAttribute('src', element.toDataURL('image/png'));
            }
            else {
                res = element.cloneNode(false);
                if ('style' in res) {
                    res.style.webkitUserSelect = 'none';
                    res.style.webkitUserCallout = 'none';
                }
                for (i = 0; i < element.childNodes.length; i++) {
                    child = element.childNodes[i];
                    res.appendChild(this.generateImage(child));
                }
            }
            if ('setAttribute' in res)
                res.setAttribute('draggable', false);
            res.onselectstart = function (e) {
                e.preventDefault();
                return false;
            };
            return res;
        };
        DragEmuDataTransfer.prototype.onTimer = function () {
            this.timer = undefined;
            this.fireEvent('start', this);
            if (this.hasData()) {
                this.hasStarted = true;
                this.image = this.generateImage(this.draggable.drawing);
                this.image.style.touchAction = 'none';
                this.image.style.zIndex = '100000';
                this.image.style.position = 'absolute';
                if ('removeProperty' in this.image.style)
                    this.image.style.removeProperty('transform');
                if (Core.Navigator.isIE && ('removeProperty' in this.image.style))
                    this.image.style.removeProperty('-ms-transform');
                else if (Core.Navigator.isGecko)
                    this.image.style.removeProperty('-moz-transform');
                else if (Core.Navigator.isWebkit)
                    this.image.style.removeProperty('-webkit-transform');
                else if (Core.Navigator.isOpera)
                    this.image.style.removeProperty('-o-transform');
                if (Core.Navigator.supportOpacity) {
                    this.image.style.opacity = '1';
                    this.image.firstChild.style.opacity = '0.8';
                }
                var ofs = this.delayed ? -10 : 0;
                this.startImagePoint = this.draggable.pointToWindow(new Ui.Point());
                this.image.style.left = (this.startImagePoint.x + ofs) + 'px';
                this.image.style.top = (this.startImagePoint.y + ofs) + 'px';
                if (this.watcher.pointer.getType() === 'mouse') {
                    this.catcher = document.createElement('div');
                    this.catcher.style.position = 'absolute';
                    this.catcher.style.left = '0px';
                    this.catcher.style.right = '0px';
                    this.catcher.style.top = '0px';
                    this.catcher.style.bottom = '0px';
                    this.catcher.style.zIndex = '1000';
                    document.body.appendChild(this.catcher);
                }
                document.body.appendChild(this.image);
                this.watcher.capture();
            }
            else {
                this.watcher.cancel();
            }
        };
        DragEmuDataTransfer.prototype.capture = function (element, effect) {
            if ((this.dragWatcher !== undefined) && (this.dragWatcher.getElement() === element))
                throw ('Drag already captured by the given element');
            if (this.dragWatcher !== undefined)
                this.dragWatcher.leave();
            this.dragWatcher = new DragWatcher(element, this);
            this.dragWatcher.setEffectAllowed(effect);
            return this.dragWatcher;
        };
        DragEmuDataTransfer.prototype.releaseDragWatcher = function (dragWatcher) {
            if (this.dragWatcher === dragWatcher) {
                this.dragWatcher.leave();
                this.dragWatcher = undefined;
            }
        };
        DragEmuDataTransfer.prototype.onPointerMove = function (watcher) {
            var deltaX;
            var deltaY;
            var delta;
            var dragEvent;
            var ofs;
            if (watcher.getIsCaptured()) {
                var clientX = watcher.pointer.getX();
                var clientY = watcher.pointer.getY();
                this.x = clientX;
                this.y = clientY;
                document.body.removeChild(this.image);
                if (this.catcher !== undefined)
                    document.body.removeChild(this.catcher);
                var overElement = Ui.App.current.elementFromPoint(new Ui.Point(clientX, clientY));
                if (this.catcher !== undefined)
                    document.body.appendChild(this.catcher);
                document.body.appendChild(this.image);
                deltaX = clientX - this.startX;
                deltaY = clientY - this.startY;
                ofs = this.delayed ? -10 : 0;
                this.image.style.left = (this.startImagePoint.x + deltaX + ofs) + 'px';
                this.image.style.top = (this.startImagePoint.y + deltaY + ofs) + 'px';
                if (overElement != undefined) {
                    var oldDropEffectIcon = this.dropEffectIcon;
                    var dragEvent_1 = new DragEvent();
                    dragEvent_1.setType('dragover');
                    dragEvent_1.clientX = clientX;
                    dragEvent_1.clientY = clientY;
                    dragEvent_1.dataTransfer = this;
                    var effectAllowed = [];
                    dragEvent_1.dispatchEvent(overElement);
                    if (this.dragWatcher !== undefined)
                        effectAllowed = this.dragWatcher.getEffectAllowed();
                    if ((this.dragWatcher !== undefined) && !overElement.getIsChildOf(this.dragWatcher.getElement())) {
                        this.dragWatcher.leave();
                        this.dragWatcher = undefined;
                    }
                    if (this.dragWatcher !== undefined)
                        this.dragWatcher.move(clientX, clientY);
                    this.dropEffect = DragEmuDataTransfer.getMatchingDropEffect(this.effectAllowed, effectAllowed, watcher.pointer.getType(), watcher.pointer.getCtrlKey(), watcher.pointer.getAltKey(), watcher.pointer.getShiftKey());
                    if (this.dropEffect.length > 1)
                        this.dropEffectIcon = 'dragchoose';
                    else if (this.dropEffect.length > 0)
                        this.dropEffectIcon = this.dropEffect[0].dragicon;
                    else
                        this.dropEffectIcon = undefined;
                    if (this.dropEffectIcon !== oldDropEffectIcon) {
                        if (this.imageEffect !== undefined) {
                            this.imageEffect.isLoaded = false;
                            this.image.removeChild(this.imageEffect.drawing);
                            this.imageEffect = undefined;
                        }
                        if (this.dropEffectIcon !== undefined) {
                            this.imageEffect = new DragEffectIcon();
                            this.imageEffect.icon = this.dropEffectIcon;
                            this.imageEffect.parent = Ui.App.current;
                            this.imageEffect.isLoaded = true;
                            this.imageEffect.parentVisible = true;
                            this.imageEffect.setParentDisabled(false);
                            var size = this.imageEffect.measure(0, 0);
                            this.imageEffect.arrange(-size.width + (this.startX - this.startImagePoint.x - ofs), -size.height + (this.startY - this.startImagePoint.y - ofs), size.width, size.height);
                            this.image.appendChild(this.imageEffect.drawing);
                        }
                    }
                    this.overElement = overElement;
                }
                else
                    this.overElement = undefined;
            }
            else {
                if (watcher.pointer.getIsMove())
                    watcher.cancel();
            }
        };
        DragEmuDataTransfer.prototype.onPointerUp = function (watcher) {
            if (!watcher.getIsCaptured())
                watcher.cancel();
            else {
                if (this.dragWatcher !== undefined) {
                    this.removeImage();
                    this.dragWatcher.leave();
                    if (this.dropEffect.length === 1)
                        this.dragWatcher.drop(this.dropEffect[0].action);
                    else if (this.dropEffect.length > 1) {
                        var popup_1 = new Ui.Popup();
                        var vbox = new Ui.VBox();
                        popup_1.content = vbox;
                        for (var i = 0; i < this.dropEffect.length; i++) {
                            var button = new Ui.Button();
                            button.text = this.dropEffect[i].text;
                            button['Ui.DragEvent.dropEffect'] = this.dropEffect[i];
                            this.connect(button, 'press', function (b) {
                                this.dragWatcher.drop(b['Ui.DragEvent.dropEffect'].action);
                                popup_1.close();
                            });
                            vbox.append(button);
                        }
                        popup_1.openAt(this.x, this.y);
                    }
                }
                else {
                    this.dropX = watcher.pointer.getX();
                    this.dropY = watcher.pointer.getY();
                    this.dropFailsTimer = new Anim.Clock({
                        duration: 0.25, ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.dropFailsTimer, 'timeupdate', this.onDropFailsTimerUpdate);
                    this.dropFailsTimer.begin();
                }
                this.fireEvent('end', this);
            }
        };
        DragEmuDataTransfer.prototype.onPointerCancel = function (watcher) {
            if (this.timer !== undefined) {
                this.timer.abort();
                this.timer = undefined;
            }
        };
        DragEmuDataTransfer.prototype.removeImage = function () {
            document.body.removeChild(this.image);
            if (this.catcher !== undefined) {
                document.body.removeChild(this.catcher);
                this.catcher = undefined;
            }
        };
        DragEmuDataTransfer.prototype.onDropFailsTimerUpdate = function (clock, progress) {
            if (progress >= 1)
                this.removeImage();
            else {
                var deltaX = (this.dropX - this.startX) * (1 - progress);
                var deltaY = (this.dropY - this.startY) * (1 - progress);
                this.image.style.left = (this.startImagePoint.x + deltaX) + 'px';
                this.image.style.top = (this.startImagePoint.y + deltaY) + 'px';
            }
        };
        DragEmuDataTransfer.getMergedEffectAllowed = function (effectAllowed1, effectAllowed2) {
            if ((effectAllowed1 === undefined) || (effectAllowed1 === 'all'))
                return effectAllowed2;
            else {
                var effectAllowed = [];
                for (var i = 0; i < effectAllowed1.length; i++) {
                    for (var i2 = 0; i2 < effectAllowed2.length; i2++) {
                        if (effectAllowed1[i] === effectAllowed2[i2].action)
                            effectAllowed.push(effectAllowed2[i2]);
                    }
                }
                return effectAllowed;
            }
        };
        DragEmuDataTransfer.getMatchingDropEffect = function (srcEffectAllowed, dstEffectAllowed, pointerType, ctrlKey, altKey, shiftKey) {
            var effectAllowed = DragEmuDataTransfer.getMergedEffectAllowed(srcEffectAllowed, dstEffectAllowed);
            var dropEffect = effectAllowed;
            if (effectAllowed.length > 1) {
                if (pointerType === 'mouse') {
                    if (!altKey) {
                        if (ctrlKey) {
                            for (var i = 0; i < effectAllowed.length; i++) {
                                if (effectAllowed[i].secondary === true)
                                    dropEffect = [effectAllowed[i]];
                            }
                            if ((dropEffect === effectAllowed) && (effectAllowed.length > 1))
                                dropEffect = [effectAllowed[1]];
                        }
                        else {
                            for (var i = 0; i < effectAllowed.length; i++) {
                                if (effectAllowed[i].primary === true)
                                    dropEffect = [effectAllowed[i]];
                            }
                            if (dropEffect === effectAllowed)
                                dropEffect = [effectAllowed[0]];
                        }
                    }
                }
            }
            return dropEffect;
        };
        return DragEmuDataTransfer;
    }(Core.Object));
    Ui.DragEmuDataTransfer = DragEmuDataTransfer;
    var DragNativeDataTransfer = (function (_super) {
        __extends(DragNativeDataTransfer, _super);
        function DragNativeDataTransfer() {
            var _this = _super.call(this) || this;
            _this.dataTransfer = undefined;
            _this.dragWatcher = undefined;
            _this.nativeData = undefined;
            _this.dropEffect = 'none';
            _this.position = undefined;
            _this.nativeData = new DragNativeData(_this);
            return _this;
        }
        DragNativeDataTransfer.prototype.getPosition = function () {
            return this.position;
        };
        DragNativeDataTransfer.prototype.setPosition = function (position) {
            this.position = position;
        };
        DragNativeDataTransfer.prototype.getData = function () {
            return this.nativeData;
        };
        DragNativeDataTransfer.prototype.setDataTransfer = function (dataTransfer) {
            this.dataTransfer = dataTransfer;
        };
        DragNativeDataTransfer.prototype.capture = function (element, effect) {
            if ((this.dragWatcher !== undefined) && (this.dragWatcher.getElement() === element))
                throw ('Drag already captured by the given element');
            if (this.dragWatcher !== undefined)
                this.dragWatcher.leave();
            this.dragWatcher = new DragWatcher(element, this);
            this.dragWatcher.setEffectAllowed(effect);
            return this.dragWatcher;
        };
        DragNativeDataTransfer.prototype.releaseDragWatcher = function (dragWatcher) {
            if (this.dragWatcher === dragWatcher) {
                this.dragWatcher.leave();
                this.dragWatcher = undefined;
            }
        };
        return DragNativeDataTransfer;
    }(Core.Object));
    Ui.DragNativeDataTransfer = DragNativeDataTransfer;
    var DragNativeManager = (function (_super) {
        __extends(DragNativeManager, _super);
        function DragNativeManager(app) {
            var _this = _super.call(this) || this;
            _this.nativeTarget = undefined;
            _this.app = app;
            _this.dataTransfer = new DragNativeDataTransfer();
            _this.connect(_this.app.drawing, 'dragover', _this.onDragOver);
            _this.connect(_this.app.drawing, 'dragenter', _this.onDragEnter);
            _this.connect(_this.app.drawing, 'dragleave', _this.onDragLeave);
            _this.connect(_this.app.drawing, 'drop', _this.onDrop);
            return _this;
        }
        DragNativeManager.prototype.onDragOver = function (event) {
            this.dataTransfer.setDataTransfer(event.dataTransfer);
            var point = new Ui.Point(event.clientX, event.clientY);
            this.dataTransfer.setPosition(point);
            var overElement = this.app.elementFromPoint(point);
            if (overElement !== undefined) {
                var dragEvent = new DragEvent();
                dragEvent.setType('dragover');
                dragEvent.clientX = event.clientX;
                dragEvent.clientY = event.clientY;
                dragEvent.dataTransfer = this.dataTransfer;
                dragEvent.dispatchEvent(overElement);
                if ((this.dataTransfer.dragWatcher !== undefined) &&
                    !overElement.getIsChildOf(this.dataTransfer.dragWatcher.getElement())) {
                    this.dataTransfer.dragWatcher.leave();
                    this.dataTransfer.dragWatcher = undefined;
                }
            }
            if (this.dataTransfer.dragWatcher !== undefined) {
                var dropEffect = DragEmuDataTransfer.getMergedEffectAllowed(this.nativeToCustom(event.dataTransfer.effectAllowed), this.dataTransfer.dragWatcher.effectAllowed);
                this.dataTransfer.dragWatcher.move(event.clientX, event.clientY);
                event.dataTransfer.dropEffect = this.customToNative(dropEffect);
            }
            else
                event.dataTransfer.dropEffect = 'none';
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        };
        DragNativeManager.prototype.onDragEnter = function (e) {
            this.nativeTarget = e.target;
        };
        DragNativeManager.prototype.onDragLeave = function (e) {
            if (this.nativeTarget !== e.target)
                return;
            this.nativeTarget = undefined;
            if (this.dataTransfer.dragWatcher !== undefined) {
                this.dataTransfer.dragWatcher.leave();
                this.dataTransfer.dragWatcher = undefined;
            }
        };
        DragNativeManager.prototype.onDrop = function (event) {
            this.dataTransfer.setDataTransfer(event.dataTransfer);
            if (this.dataTransfer.dragWatcher !== undefined) {
                this.dataTransfer.dragWatcher.leave();
                var dropEffect = DragEmuDataTransfer.getMergedEffectAllowed(this.nativeToCustom(event.dataTransfer.effectAllowed), this.dataTransfer.dragWatcher.effectAllowed);
                event.dataTransfer.dropEffect = this.customToNative(dropEffect);
                if (dropEffect.length > 0)
                    this.dataTransfer.dragWatcher.drop(dropEffect[0].action);
                this.dataTransfer.dragWatcher = undefined;
            }
            event.stopImmediatePropagation();
            event.preventDefault();
        };
        DragNativeManager.prototype.nativeToCustom = function (effectAllowed) {
            if (effectAllowed === 'copy')
                return ['copy'];
            else if (effectAllowed === 'link')
                return ['link'];
            else if (effectAllowed === 'move')
                return ['move'];
            else if (effectAllowed === 'copyLink')
                return ['copy', 'link'];
            else if (effectAllowed === 'copyMove')
                return ['move', 'copy'];
            else if (effectAllowed === 'linkMove')
                return ['move', 'link'];
            else if (effectAllowed === 'all')
                return ['move', 'copy', 'link'];
        };
        DragNativeManager.prototype.customToNative = function (effectAllowed) {
            var containsLink = false;
            var containsCopy = false;
            var containsMove = false;
            for (var i = 0; i < effectAllowed.length; i++) {
                if (effectAllowed[i].action === 'link')
                    containsLink = true;
                else if (effectAllowed[i].action === 'move')
                    containsMove = true;
                else if (effectAllowed[i].action === 'copy')
                    containsCopy = true;
            }
            if (containsLink && containsCopy && containsMove)
                return 'all';
            else if (containsLink && containsCopy)
                return 'copyLink';
            else if (containsLink && containsMove)
                return 'linkMove';
            else if (containsMove && containsCopy)
                return 'copyMove';
            else if (containsLink)
                return 'link';
            else if (containsMove)
                return 'move';
            else if (containsCopy)
                return 'copy';
            else
                return 'none';
        };
        return DragNativeManager;
    }(Core.Object));
    Ui.DragNativeManager = DragNativeManager;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var WheelEvent = (function (_super) {
        __extends(WheelEvent, _super);
        function WheelEvent() {
            var _this = _super.call(this) || this;
            _this.deltaX = 0;
            _this.deltaY = 0;
            _this.clientX = 0;
            _this.clientY = 0;
            _this.ctrlKey = false;
            _this.altKey = false;
            _this.shiftKey = false;
            _this.metaKey = false;
            _this.setType('wheel');
            return _this;
        }
        WheelEvent.prototype.setClientX = function (clientX) {
            this.clientX = clientX;
        };
        WheelEvent.prototype.setClientY = function (clientY) {
            this.clientY = clientY;
        };
        WheelEvent.prototype.setDeltaX = function (deltaX) {
            this.deltaX = deltaX;
        };
        WheelEvent.prototype.setDeltaY = function (deltaY) {
            this.deltaY = deltaY;
        };
        WheelEvent.prototype.setCtrlKey = function (ctrlKey) {
            this.ctrlKey = ctrlKey;
        };
        WheelEvent.prototype.setAltKey = function (altKey) {
            this.altKey = altKey;
        };
        WheelEvent.prototype.setShiftKey = function (shiftKey) {
            this.shiftKey = shiftKey;
        };
        WheelEvent.prototype.setMetaKey = function (metaKey) {
            this.metaKey = metaKey;
        };
        return WheelEvent;
    }(Ui.Event));
    Ui.WheelEvent = WheelEvent;
    var WheelManager = (function (_super) {
        __extends(WheelManager, _super);
        function WheelManager(app) {
            var _this = _super.call(this) || this;
            _this.app = app;
            _this.connect(_this.app.drawing, 'mousewheel', _this.onMouseWheel);
            _this.connect(_this.app.drawing, 'DOMMouseScroll', _this.onMouseWheel);
            return _this;
        }
        WheelManager.prototype.onMouseWheel = function (event) {
            var deltaX = 0;
            var deltaY = 0;
            if ((event.wheelDeltaX != undefined) && (event.wheelDeltaY != undefined)) {
                deltaX = -event.wheelDeltaX / 5;
                deltaY = -event.wheelDeltaY / 5;
            }
            else if (event.wheelDelta != undefined)
                deltaY = -event.wheelDelta / 2;
            else if (event.detail != undefined)
                deltaY = event.detail * 20;
            var target = Ui.App.current.elementFromPoint(new Ui.Point(event.clientX, event.clientY));
            if (target !== undefined) {
                var wheelEvent = new Ui.WheelEvent();
                wheelEvent.setClientX(event.clientX);
                wheelEvent.setClientY(event.clientY);
                wheelEvent.setDeltaX(deltaX);
                wheelEvent.setDeltaY(deltaY);
                wheelEvent.setCtrlKey(event.ctrlKey);
                wheelEvent.setAltKey(event.altKey);
                wheelEvent.setShiftKey(event.shiftKey);
                wheelEvent.setMetaKey(event.metaKey);
                wheelEvent.dispatchEvent(target);
                event.preventDefault();
            }
        };
        return WheelManager;
    }(Core.Object));
    Ui.WheelManager = WheelManager;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var LBox = (function (_super) {
        __extends(LBox, _super);
        function LBox(init) {
            var _this = _super.call(this) || this;
            _this._paddingTop = 0;
            _this._paddingBottom = 0;
            _this._paddingLeft = 0;
            _this._paddingRight = 0;
            if (init)
                _this.assign(init);
            return _this;
        }
        LBox.prototype.setContent = function (content) {
            if ((this.children.length === 1) && (content === this.firstChild))
                return;
            while (this.firstChild != undefined)
                this.removeChild(this.firstChild);
            if (content != undefined) {
                if (content instanceof Array) {
                    var elements = content;
                    for (var i = 0; i < elements.length; i++)
                        this.append(content[i]);
                }
                else
                    this.append(content);
            }
        };
        Object.defineProperty(LBox.prototype, "content", {
            set: function (content) {
                this.setContent(content);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LBox.prototype, "padding", {
            set: function (padding) {
                this.paddingTop = padding;
                this.paddingBottom = padding;
                this.paddingLeft = padding;
                this.paddingRight = padding;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LBox.prototype, "paddingTop", {
            get: function () {
                return this._paddingTop;
            },
            set: function (paddingTop) {
                if (this._paddingTop != paddingTop) {
                    this._paddingTop = paddingTop;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LBox.prototype, "paddingBottom", {
            get: function () {
                return this._paddingBottom;
            },
            set: function (paddingBottom) {
                if (this._paddingBottom != paddingBottom) {
                    this._paddingBottom = paddingBottom;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LBox.prototype, "paddingLeft", {
            get: function () {
                return this._paddingLeft;
            },
            set: function (paddingLeft) {
                if (this._paddingLeft != paddingLeft) {
                    this._paddingLeft = paddingLeft;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LBox.prototype, "paddingRight", {
            get: function () {
                return this._paddingRight;
            },
            set: function (paddingRight) {
                if (this._paddingRight != paddingRight) {
                    this._paddingRight = paddingRight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        LBox.prototype.append = function (child) {
            this.appendChild(child);
        };
        LBox.prototype.prepend = function (child) {
            this.prependChild(child);
        };
        LBox.prototype.insertBefore = function (child, beforeChild) {
            this.insertChildBefore(child, beforeChild);
        };
        LBox.prototype.remove = function (child) {
            this.removeChild(child);
        };
        LBox.prototype.measureCore = function (width, height) {
            var left = this.paddingLeft;
            var right = this.paddingRight;
            var top = this.paddingTop;
            var bottom = this.paddingBottom;
            var constraintWidth = Math.max(width - (left + right), 0);
            var constraintHeight = Math.max(height - (top + bottom), 0);
            var minWidth = 0;
            var minHeight = 0;
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var size = child.measure(constraintWidth, constraintHeight);
                if (size.width > minWidth)
                    minWidth = size.width;
                if (size.height > minHeight)
                    minHeight = size.height;
            }
            minWidth += left + right;
            minHeight += top + bottom;
            return { width: minWidth, height: minHeight };
        };
        LBox.prototype.arrangeCore = function (width, height) {
            var left = this.paddingLeft;
            var right = this.paddingRight;
            var top = this.paddingTop;
            var bottom = this.paddingBottom;
            width -= left + right;
            height -= top + bottom;
            for (var i = 0; i < this.children.length; i++)
                this.children[i].arrange(left, top, width, height);
        };
        return LBox;
    }(Ui.Container));
    Ui.LBox = LBox;
    var LPBox = (function (_super) {
        __extends(LPBox, _super);
        function LPBox(init) {
            var _this = _super.call(this) || this;
            if (init)
                _this.assign(init);
            return _this;
        }
        LPBox.prototype.appendAtLayer = function (child, layer) {
            if (layer === undefined)
                layer = 1;
            child['Ui.LPBox.layer'] = layer;
            var i = 0;
            for (; (i < this.children.length) && (this.children[i]['Ui.LPBox.layer'] <= layer); i++) { }
            this.insertChildAt(child, i);
        };
        LPBox.prototype.prependAtLayer = function (child, layer) {
            if (layer === undefined)
                layer = 1;
            child['Ui.LPBox.layer'] = layer;
            var i = 0;
            for (; (i < this.children.length) && (this.children[i]['Ui.LPBox.layer'] < layer); i++) { }
            i = Math.max(0, i);
            this.insertChildAt(child, i);
        };
        return LPBox;
    }(LBox));
    Ui.LPBox = LPBox;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Box = (function (_super) {
        __extends(Box, _super);
        function Box(init) {
            var _this = _super.call(this) || this;
            _this._paddingTop = 0;
            _this._paddingBottom = 0;
            _this._paddingLeft = 0;
            _this._paddingRight = 0;
            _this._uniform = false;
            _this._spacing = 0;
            _this.star = 0;
            _this.vertical = true;
            _this.uniformSize = 0;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Box.prototype, "content", {
            set: function (content) {
                while (this.firstChild !== undefined)
                    this.removeChild(this.firstChild);
                if (content != undefined) {
                    if (content instanceof Ui.Element)
                        this.append(content);
                    else {
                        var ar = content;
                        for (var i = 0; i < ar.length; i++)
                            this.append(ar[i]);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "orientation", {
            get: function () {
                if (this.vertical)
                    return 'vertical';
                else
                    return 'horizontal';
            },
            set: function (orientation) {
                var vertical = true;
                if (orientation !== 'vertical')
                    vertical = false;
                if (this.vertical !== vertical) {
                    this.vertical = vertical;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "padding", {
            set: function (padding) {
                this.paddingTop = padding;
                this.paddingBottom = padding;
                this.paddingLeft = padding;
                this.paddingRight = padding;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "paddingTop", {
            get: function () {
                return this._paddingTop;
            },
            set: function (paddingTop) {
                if (this._paddingTop != paddingTop) {
                    this._paddingTop = paddingTop;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "paddingBottom", {
            get: function () {
                return this._paddingBottom;
            },
            set: function (paddingBottom) {
                if (this._paddingBottom != paddingBottom) {
                    this._paddingBottom = paddingBottom;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "paddingLeft", {
            get: function () {
                return this._paddingLeft;
            },
            set: function (paddingLeft) {
                if (this._paddingLeft != paddingLeft) {
                    this._paddingLeft = paddingLeft;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "paddingRight", {
            get: function () {
                return this._paddingRight;
            },
            set: function (paddingRight) {
                if (this._paddingRight != paddingRight) {
                    this._paddingRight = paddingRight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "uniform", {
            get: function () {
                return this._uniform;
            },
            set: function (uniform) {
                if (this._uniform != uniform) {
                    this._uniform = uniform;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Box.prototype, "spacing", {
            get: function () {
                return this._spacing;
            },
            set: function (spacing) {
                if (this._spacing != spacing) {
                    this._spacing = spacing;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Box.prototype.append = function (child, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            this.appendChild(child);
        };
        Box.prototype.prepend = function (child, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            this.prependChild(child);
        };
        Box.prototype.insertAt = function (child, position, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            this.insertChildAt(child, position);
        };
        Box.prototype.moveAt = function (child, position) {
            this.moveChildAt(child, position);
        };
        Box.prototype.remove = function (child) {
            this.removeChild(child);
        };
        Box.prototype.measureUniform = function (width, height) {
            var constraintSize = this.vertical ? height : width;
            var constraintOpSize = this.vertical ? width : height;
            constraintSize -= this._spacing * (this.children.length - 1);
            var childConstraintSize = constraintSize / this.children.length;
            var countResizable = 0;
            var uniformSize = 0;
            var minOpSize = 0;
            var loop = true;
            while (loop) {
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    if (Ui.Box.getResizable(child))
                        countResizable++;
                    var size = void 0;
                    if (this.vertical)
                        size = child.measure(constraintOpSize, childConstraintSize);
                    else
                        size = child.measure(childConstraintSize, constraintOpSize);
                    if ((this.vertical ? size.width : size.height) > minOpSize)
                        minOpSize = this.vertical ? size.width : size.height;
                    if ((this.vertical ? size.height : size.width) > uniformSize)
                        uniformSize = this.vertical ? size.height : size.width;
                }
                if ((minOpSize > constraintOpSize) || (uniformSize > childConstraintSize)) {
                    if (uniformSize > childConstraintSize)
                        childConstraintSize = uniformSize;
                    constraintOpSize = minOpSize;
                    minOpSize = 0;
                    uniformSize = 0;
                    countResizable = 0;
                }
                else
                    loop = false;
            }
            this.uniformSize = uniformSize;
            var minSize = this.uniformSize * this.children.length;
            minSize += this._spacing * (this.children.length - 1);
            if (this.vertical)
                return { width: minOpSize, height: minSize };
            else
                return { width: minSize, height: minOpSize };
        };
        Box.prototype.measureNonUniformVertical = function (width, height) {
            var i;
            var child;
            var size;
            var constraintWidth = width;
            var constraintHeight = height;
            constraintHeight -= this._spacing * (this.children.length - 1);
            var countResizable;
            var minWidth;
            var minHeight;
            var loop = true;
            var star = 0;
            var resizableMinHeight = 0;
            while (loop) {
                countResizable = 0;
                minWidth = 0;
                minHeight = 0;
                for (i = 0; i < this.children.length; i++) {
                    child = this.children[i];
                    if (!Ui.Box.getResizable(child)) {
                        size = child.measure(constraintWidth, 0);
                        if (size.width > minWidth)
                            minWidth = size.width;
                        minHeight += size.height;
                    }
                    else {
                        child.boxStarDone = false;
                        countResizable++;
                    }
                }
                resizableMinHeight = 0;
                if (countResizable > 0) {
                    var remainHeight = constraintHeight - minHeight;
                    var starFound = true;
                    star = remainHeight / countResizable;
                    do {
                        resizableMinHeight = 0;
                        starFound = true;
                        for (i = 0; i < this.children.length; i++) {
                            child = this.children[i];
                            if (Ui.Box.getResizable(child)) {
                                if (!child.boxStarDone) {
                                    size = child.measure(constraintWidth, star);
                                    if (size.width > minWidth)
                                        minWidth = size.width;
                                    if (size.height > star) {
                                        child.boxStarDone = true;
                                        starFound = false;
                                        remainHeight -= size.height;
                                        minHeight += size.height;
                                        countResizable--;
                                        star = remainHeight / countResizable;
                                        break;
                                    }
                                    else
                                        resizableMinHeight += size.height;
                                }
                            }
                        }
                    } while (!starFound);
                }
                if (minWidth > constraintWidth)
                    constraintWidth = minWidth;
                else
                    loop = false;
            }
            minHeight += this._spacing * (this.children.length - 1);
            if (countResizable > 0) {
                minHeight += resizableMinHeight;
                this.star = star;
            }
            else
                this.star = 0;
            return { width: minWidth, height: minHeight };
        };
        Box.prototype.measureNonUniformHorizontal = function (width, height) {
            var i;
            var child;
            var size;
            var constraintWidth = width;
            var constraintHeight = height;
            constraintWidth -= this._spacing * (this.children.length - 1);
            var countResizable;
            var minWidth;
            var minHeight;
            var loop = true;
            var star = 0;
            var resizableMinWidth = 0;
            while (loop) {
                countResizable = 0;
                minWidth = 0;
                minHeight = 0;
                for (i = 0; i < this.children.length; i++) {
                    child = this.children[i];
                    if (!Ui.Box.getResizable(child)) {
                        size = child.measure(0, constraintHeight);
                        if (size.height > minHeight)
                            minHeight = size.height;
                        minWidth += size.width;
                    }
                    else {
                        child.boxStarDone = false;
                        countResizable++;
                    }
                }
                resizableMinWidth = 0;
                if (countResizable > 0) {
                    var remainWidth = constraintWidth - minWidth;
                    var starFound = true;
                    star = remainWidth / countResizable;
                    do {
                        resizableMinWidth = 0;
                        starFound = true;
                        for (i = 0; i < this.children.length; i++) {
                            child = this.children[i];
                            if (Ui.Box.getResizable(child)) {
                                if (!child.boxStarDone) {
                                    size = child.measure(star, constraintHeight);
                                    if (size.height > minHeight)
                                        minHeight = size.height;
                                    if (size.width > star) {
                                        child.boxStarDone = true;
                                        starFound = false;
                                        remainWidth -= size.width;
                                        minWidth += size.width;
                                        countResizable--;
                                        star = remainWidth / countResizable;
                                        break;
                                    }
                                    else
                                        resizableMinWidth += size.width;
                                }
                            }
                        }
                    } while (!starFound);
                }
                if (minHeight > constraintHeight)
                    constraintHeight = minHeight;
                else
                    loop = false;
            }
            minWidth += this._spacing * (this.children.length - 1);
            if (countResizable > 0) {
                minWidth += resizableMinWidth;
                this.star = star;
            }
            else
                this.star = 0;
            return { width: minWidth, height: minHeight };
        };
        Box.prototype.measureCore = function (width, height) {
            var left = this.paddingLeft;
            var right = this.paddingRight;
            var top = this.paddingTop;
            var bottom = this.paddingBottom;
            var constraintWidth = Math.max(0, width - (left + right));
            var constraintHeight = Math.max(0, height - (top + bottom));
            var size;
            if (this._uniform)
                size = this.measureUniform(constraintWidth, constraintHeight);
            else {
                if (this.vertical)
                    size = this.measureNonUniformVertical(constraintWidth, constraintHeight);
                else
                    size = this.measureNonUniformHorizontal(constraintWidth, constraintHeight);
            }
            size.width += left + right;
            size.height += top + bottom;
            return size;
        };
        Box.prototype.arrangeCore = function (width, height) {
            var left = this._paddingLeft;
            var right = this._paddingRight;
            var top = this._paddingTop;
            var bottom = this._paddingBottom;
            width -= left + right;
            height -= top + bottom;
            var offset = this.vertical ? top : left;
            var countResizable = 0;
            var minSize = 0;
            var maxSize = 0;
            var count = this.children.length;
            var countVisible = 0;
            for (var i = 0; i < count; i++) {
                var child = this.children[i];
                var size = this.vertical ? child.measureHeight : child.measureWidth;
                if (Ui.Box.getResizable(child)) {
                    countVisible++;
                    countResizable++;
                    child['Ui.Box.StarDone'] = false;
                }
                else {
                    if (size > 0)
                        countVisible++;
                    minSize += size;
                }
                if (size > maxSize)
                    maxSize = size;
            }
            minSize += Math.max(0, countVisible - 1) * this._spacing;
            var star = 0;
            var uniformSize = 0;
            if (countResizable > 0) {
                if (this._uniform)
                    uniformSize = ((this.vertical ? height : width) - (this._spacing * (countVisible - 1))) / countVisible;
                else {
                    var remainSize = (this.vertical ? height : width) - minSize;
                    var starFound = true;
                    star = remainSize / countResizable;
                    do {
                        starFound = true;
                        for (var i = 0; i < count; i++) {
                            var child = this.children[i];
                            if (Ui.Box.getResizable(child)) {
                                var size = this.vertical ? child.measureHeight : child.measureWidth;
                                if (!child['Ui.Box.StarDone']) {
                                    if (size > star) {
                                        child['Ui.Box.StarDone'] = true;
                                        starFound = false;
                                        remainSize -= size;
                                        minSize += size;
                                        countResizable--;
                                        star = remainSize / countResizable;
                                        break;
                                    }
                                }
                            }
                        }
                    } while (!starFound);
                }
            }
            else {
                if (this._uniform)
                    uniformSize = maxSize;
            }
            var isFirst = true;
            for (var i = 0; i < count; i++) {
                var child = this.children[i];
                var size = this.vertical ? child.measureHeight : child.measureWidth;
                if (this._uniform) {
                    if (isFirst)
                        isFirst = false;
                    else
                        offset += this._spacing;
                    if (this.vertical)
                        child.arrange(left, offset, width, uniformSize);
                    else
                        child.arrange(offset, top, uniformSize, height);
                    offset += uniformSize;
                }
                else {
                    if ((Ui.Box.getResizable(child)) && ((this.vertical ? child.measureHeight : child.measureWidth) < this.star)) {
                        if (isFirst)
                            isFirst = false;
                        else
                            offset += this._spacing;
                        if (this.vertical)
                            child.arrange(left, offset, width, star);
                        else
                            child.arrange(offset, top, star, height);
                        offset += star;
                    }
                    else if (size > 0) {
                        if (isFirst)
                            isFirst = false;
                        else
                            offset += this._spacing;
                        if (this.vertical) {
                            child.arrange(left, offset, width, child.measureHeight);
                            offset += child.measureHeight;
                        }
                        else {
                            child.arrange(offset, top, child.measureWidth, height);
                            offset += child.measureWidth;
                        }
                    }
                }
            }
        };
        Box.getResizable = function (child) {
            return child['Ui.Box.resizable'] ? true : false;
        };
        Box.setResizable = function (child, resizable) {
            if (Ui.Box.getResizable(child) !== resizable) {
                child['Ui.Box.resizable'] = resizable;
                child.invalidateMeasure();
            }
        };
        return Box;
    }(Ui.Container));
    Ui.Box = Box;
    var VBox = (function (_super) {
        __extends(VBox, _super);
        function VBox(init) {
            var _this = _super.call(this) || this;
            _this.orientation = 'vertical';
            if (init)
                _this.assign(init);
            return _this;
        }
        return VBox;
    }(Box));
    Ui.VBox = VBox;
    var HBox = (function (_super) {
        __extends(HBox, _super);
        function HBox(init) {
            var _this = _super.call(this) || this;
            _this.orientation = 'horizontal';
            if (init)
                _this.assign(init);
            return _this;
        }
        return HBox;
    }(Box));
    Ui.HBox = HBox;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Overable = (function (_super) {
        __extends(Overable, _super);
        function Overable(init) {
            var _this = _super.call(this) || this;
            _this.watcher = undefined;
            _this.addEvents('enter', 'leave', 'move');
            _this.connect(_this, 'ptrmove', function (event) {
                if (!_this.isDisabled && (_this.watcher == undefined)) {
                    _this.watcher = event.pointer.watch(_this);
                    _this.fireEvent('enter', _this);
                    _this.connect(_this.watcher, 'move', function () {
                        if (!_this.watcher.getIsInside())
                            _this.watcher.cancel();
                    });
                    _this.connect(_this.watcher, 'cancel', function () {
                        _this.watcher = undefined;
                        _this.fireEvent('leave', _this);
                    });
                }
            });
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Overable.prototype, "isOver", {
            get: function () {
                return (this.watcher !== undefined);
            },
            enumerable: true,
            configurable: true
        });
        return Overable;
    }(Ui.LBox));
    Ui.Overable = Overable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Pressable = (function (_super) {
        __extends(Pressable, _super);
        function Pressable(init) {
            var _this = _super.call(this) || this;
            _this._lock = false;
            _this._isDown = false;
            _this.lastTime = undefined;
            _this.addEvents('press', 'down', 'up', 'activate');
            _this.drawing.style.cursor = 'pointer';
            _this.focusable = true;
            _this.role = 'button';
            _this.connect(_this, 'ptrdown', _this.onPointerDown);
            _this.connect(_this.drawing, 'keydown', _this.onKeyDown);
            _this.connect(_this.drawing, 'keyup', _this.onKeyUp);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Pressable.prototype, "isDown", {
            get: function () {
                return this._isDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pressable.prototype, "lock", {
            get: function () {
                return this._lock;
            },
            set: function (lock) {
                this._lock = lock;
                if (lock)
                    this.drawing.style.cursor = '';
                else
                    this.drawing.style.cursor = 'pointer';
            },
            enumerable: true,
            configurable: true
        });
        Pressable.prototype.press = function () {
            this.onPress();
        };
        Pressable.prototype.activate = function () {
            this.onActivate();
        };
        Pressable.prototype.onPointerDown = function (event) {
            if (this.isDisabled || this._isDown || this._lock)
                return;
            var watcher = event.pointer.watch(this);
            this.connect(watcher, 'move', function () {
                if (watcher.pointer.getIsMove())
                    watcher.cancel();
            });
            this.connect(watcher, 'up', function (event) {
                this.onUp();
                this.onPress(event.pointer.getX(), event.pointer.getY());
                var currentTime = (new Date().getTime()) / 1000;
                if ((this.lastTime !== undefined) && (currentTime - this.lastTime < 0.30))
                    this.onActivate(event.pointer.getX(), event.pointer.getY());
                this.lastTime = currentTime;
                watcher.capture();
                watcher.cancel();
            });
            this.connect(watcher, 'cancel', function () {
                this.onUp();
            });
            this.onDown();
        };
        Pressable.prototype.onKeyDown = function (event) {
            var key = event.which;
            if ((key == 13) && !this.isDisabled && !this._lock) {
                event.preventDefault();
                event.stopPropagation();
                this.onDown();
            }
        };
        Pressable.prototype.onKeyUp = function (event) {
            var key = event.which;
            if ((this._isDown) && (key == 13) && !this.isDisabled && !this._lock) {
                event.preventDefault();
                event.stopPropagation();
                this.onUp();
                this.onPress();
            }
        };
        Pressable.prototype.onDown = function () {
            this._isDown = true;
            this.fireEvent('down', this);
        };
        Pressable.prototype.onUp = function () {
            this._isDown = false;
            this.fireEvent('up', this);
        };
        Pressable.prototype.onPress = function (x, y) {
            this.fireEvent('press', this, x, y);
        };
        Pressable.prototype.onActivate = function () {
            this.fireEvent('activate', this);
        };
        Pressable.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.drawing.style.cursor = '';
        };
        Pressable.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            if (this._lock)
                this.drawing.style.cursor = '';
            else
                this.drawing.style.cursor = 'pointer';
        };
        return Pressable;
    }(Ui.Overable));
    Ui.Pressable = Pressable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Draggable = (function (_super) {
        __extends(Draggable, _super);
        function Draggable(init) {
            var _this = _super.call(this) || this;
            _this.allowedMode = 'all';
            _this.draggableData = undefined;
            _this._dragDelta = undefined;
            _this.dataTransfer = undefined;
            _this.addEvents('dragstart', 'dragend');
            _this.connect(_this, 'ptrdown', _this.onDraggablePointerDown);
            if (init)
                _this.assign(init);
            return _this;
        }
        Draggable.prototype.setAllowedMode = function (allowedMode) {
            this.allowedMode = allowedMode;
        };
        Object.defineProperty(Draggable.prototype, "dragDelta", {
            get: function () {
                return this._dragDelta;
            },
            enumerable: true,
            configurable: true
        });
        Draggable.prototype.onDraggablePointerDown = function (event) {
            if (this.lock || this.isDisabled || (this.draggableData === undefined))
                return;
            this.dataTransfer = new Ui.DragEmuDataTransfer(this, event.clientX, event.clientY, true, event.pointer);
            this._dragDelta = this.pointFromWindow(new Ui.Point(event.clientX, event.clientY));
            this.connect(this.dataTransfer, 'start', this.onDragStart);
            this.connect(this.dataTransfer, 'end', this.onDragEnd);
        };
        Draggable.prototype.onDragStart = function (dataTransfer) {
            dataTransfer.effectAllowed = this.allowedMode;
            dataTransfer.setData(this.draggableData);
            this.fireEvent('dragstart', this, dataTransfer);
        };
        Draggable.prototype.onDragEnd = function (dataTransfer) {
            this.fireEvent('dragend', this, dataTransfer.dropEffect);
        };
        return Draggable;
    }(Ui.Pressable));
    Ui.Draggable = Draggable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Selectionable = (function (_super) {
        __extends(Selectionable, _super);
        function Selectionable(init) {
            var _this = _super.call(this) || this;
            _this.isSelected = false;
            _this.handler = undefined;
            _this.connect(_this, 'activate', _this.onSelectionableActivate);
            _this.connect(_this, 'dragstart', _this.onSelectionableDragStart);
            _this.connect(_this, 'dragend', _this.onSelectionableDragEnd);
            if (init)
                _this.assign(init);
            return _this;
        }
        Selectionable.prototype.getIsSelected = function () {
            return this.isSelected;
        };
        Selectionable.prototype.setIsSelected = function (isSelected) {
            if (this.isSelected !== isSelected) {
                this.isSelected = isSelected;
                if (this.isSelected)
                    this.onSelect();
                else
                    this.onUnselect();
            }
        };
        Selectionable.prototype.onSelect = function () {
        };
        Selectionable.prototype.onUnselect = function () {
        };
        Selectionable.prototype.getSelectionActions = function () {
            return {};
        };
        Selectionable.prototype.getParentSelectionHandler = function () {
            var parent = this.parent;
            while (parent !== undefined) {
                if ('getSelectionHandler' in parent)
                    break;
                parent = parent.parent;
            }
            if (parent !== undefined)
                return parent.getSelectionHandler();
            else
                return undefined;
        };
        Selectionable.prototype.onSelectionableDragStart = function () {
            this.select();
        };
        Selectionable.prototype.onSelectionableDragEnd = function () {
            if (this.getIsSelected()) {
                var handler = this.getParentSelectionHandler();
                if (handler !== undefined)
                    handler.clear();
            }
        };
        Selectionable.prototype.onSelectionableActivate = function () {
            if (this.isLoaded) {
                this.select();
                var handler = this.getParentSelectionHandler();
                if (handler !== undefined) {
                    if (handler.getDefaultAction() !== undefined)
                        handler.executeDefaultAction();
                    else
                        this.unselect();
                }
            }
        };
        Selectionable.prototype.select = function () {
            if (this.isLoaded) {
                this.handler = this.getParentSelectionHandler();
                if (this.handler !== undefined) {
                    this.handler.append(this);
                    this.setIsSelected(true);
                }
            }
        };
        Selectionable.prototype.unselect = function () {
            if (this.handler !== undefined) {
                this.handler.remove(this);
                this.setIsSelected(false);
            }
        };
        Selectionable.prototype.onUnload = function () {
            if (this.getIsSelected())
                this.unselect();
            _super.prototype.onUnload.call(this);
        };
        return Selectionable;
    }(Ui.Draggable));
    Ui.Selectionable = Selectionable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Selection = (function (_super) {
        __extends(Selection, _super);
        function Selection() {
            var _this = _super.call(this) || this;
            _this.elements = undefined;
            _this.addEvents('change');
            _this.elements = [];
            return _this;
        }
        Selection.prototype.clear = function () {
            var currentElements = this.elements;
            this.elements = [];
            for (var i = 0; i < currentElements.length; i++) {
                this.connect(currentElements[i], 'unload', this.onElementUnload);
                currentElements[i].setIsSelected(false);
            }
            this.fireEvent('change', this);
        };
        Selection.prototype.append = function (element) {
            var i;
            var found = false;
            for (i = 0; !found && (i < this.elements.length); i++)
                found = (this.elements[i] === element);
            if (!found) {
                var hasMultiple = false;
                var actions = this.getElementActions(element);
                for (var actionName in actions) {
                    if (actions[actionName].multiple === true)
                        hasMultiple = true;
                }
                if (this.elements.length > 0) {
                    var compat = true;
                    for (i = 0; compat && (i < this.elements.length); i++) {
                        var otherCompat = false;
                        var otherActions = this.getElementActions(this.elements[i]);
                        for (var actionKey in actions) {
                            var action = actions[actionKey];
                            if (action.multiple === true) {
                                for (var otherActionKey in otherActions) {
                                    var otherAction = otherActions[otherActionKey];
                                    if ((otherAction.multiple === true) && (otherAction.callback === action.callback)) {
                                        otherCompat = true;
                                        break;
                                    }
                                }
                            }
                        }
                        compat = compat && otherCompat;
                    }
                    if (!compat || !hasMultiple) {
                        for (i = 0; i < this.elements.length; i++)
                            this.elements[i].setIsSelected(false);
                        this.elements = [];
                    }
                }
                this.elements.push(element);
                this.connect(element, 'unload', this.onElementUnload);
                this.fireEvent('change', this);
            }
        };
        Selection.prototype.remove = function (element) {
            var foundPos;
            for (var i = 0; (foundPos === undefined) && (i < this.elements.length); i++)
                if (this.elements[i] === element)
                    foundPos = i;
            if (foundPos !== undefined) {
                this.elements.splice(foundPos, 1);
                this.disconnect(element, 'unload', this.onElementUnload);
                this.fireEvent('change', this);
            }
        };
        Selection.prototype.getElements = function () {
            return this.elements.slice();
        };
        Selection.prototype.getElementActions = function (element) {
            var actions = Core.Util.clone(element.getSelectionActions());
            var current = element.parent;
            while (current != undefined) {
                if ('getContextActions' in current)
                    actions = current.getContextActions(element, actions);
                current = current.parent;
            }
            return actions;
        };
        Selection.prototype.getActions = function () {
            var actions;
            var allActions;
            var actionName;
            var action;
            if (this.elements.length === 0)
                return undefined;
            else {
                if (this.elements.length === 1) {
                    actions = {};
                    allActions = this.getElementActions(this.elements[0]);
                    for (actionName in allActions) {
                        action = allActions[actionName];
                        if (!('testRight' in action) || action.testRight.call(this.elements[0]))
                            actions[actionName] = allActions[actionName];
                    }
                    return actions;
                }
                else {
                    actions = {};
                    allActions = this.getElementActions(this.elements[0]);
                    for (actionName in allActions) {
                        action = allActions[actionName];
                        if (action.multiple === true) {
                            var compat = true;
                            for (var i = 1; compat && (i < this.elements.length); i++) {
                                var otherCompat = false;
                                var otherActions = this.getElementActions(this.elements[i]);
                                for (var otherActionKey in otherActions) {
                                    var otherAction = otherActions[otherActionKey];
                                    if ((otherAction.multiple === true) && (otherAction.callback === action.callback)) {
                                        otherCompat = true;
                                        break;
                                    }
                                }
                                compat = compat && otherCompat;
                            }
                            if (compat) {
                                var allowed = true;
                                if ('testRight' in action) {
                                    for (var i = 0; allowed && (i < this.elements.length); i++) {
                                        allowed = allowed && action.testRight.call(this.elements[i]);
                                    }
                                }
                                if (allowed)
                                    actions[actionName] = allActions[actionName];
                            }
                        }
                    }
                    return actions;
                }
            }
        };
        Selection.prototype.getDefaultAction = function () {
            var actions = this.getActions();
            for (var actionName in actions) {
                if (actions[actionName]['default'] === true)
                    return actions[actionName];
            }
            return undefined;
        };
        Selection.prototype.executeDefaultAction = function () {
            var action = this.getDefaultAction();
            if (action !== undefined) {
                var scope = this;
                if ('scope' in action)
                    scope = action.scope;
                action.callback.call(scope, this);
                this.clear();
                return true;
            }
            else {
                return false;
            }
        };
        Selection.prototype.getDeleteAction = function () {
            var actions = this.getActions();
            if ('delete' in actions)
                return actions['delete'];
            else if (actions.suppress !== undefined)
                return actions.suppress;
            else
                return undefined;
        };
        Selection.prototype.executeDeleteAction = function () {
            var action = this.getDeleteAction();
            if (action !== undefined) {
                var scope = this;
                if ('scope' in action)
                    scope = action.scope;
                action.callback.call(scope, this);
                this.clear();
                return true;
            }
            else {
                return false;
            }
        };
        Selection.prototype.onElementUnload = function (element) {
            this.remove(element);
        };
        return Selection;
    }(Core.Object));
    Ui.Selection = Selection;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(init) {
            var _this = _super.call(this) || this;
            _this._text = '';
            _this._orientation = 'horizontal';
            _this._fontSize = undefined;
            _this._fontFamily = undefined;
            _this._fontWeight = undefined;
            _this._color = undefined;
            _this.textMeasureValid = false;
            _this.textWidth = 0;
            _this.textHeight = 0;
            _this.verticalAlign = 'center';
            _this.horizontalAlign = 'center';
            _this.selectable = false;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Label.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                if (this._text != text) {
                    this._text = text;
                    if ('textContent' in this.labelDrawing)
                        this.labelDrawing.textContent = this._text;
                    else
                        this.labelDrawing.innerText = this._text;
                    this.textMeasureValid = false;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "fontSize", {
            get: function () {
                if (this._fontSize !== undefined)
                    return this._fontSize;
                else
                    return this.getStyleProperty('fontSize');
            },
            set: function (fontSize) {
                if (this._fontSize !== fontSize) {
                    this._fontSize = fontSize;
                    this.labelDrawing.style.fontSize = this.fontSize + 'px';
                    this.textMeasureValid = false;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "fontFamily", {
            get: function () {
                if (this._fontFamily !== undefined)
                    return this._fontFamily;
                else
                    return this.getStyleProperty('fontFamily');
            },
            set: function (fontFamily) {
                if (this._fontFamily !== fontFamily) {
                    this._fontFamily = fontFamily;
                    this.labelDrawing.style.fontFamily = this.fontFamily;
                    this.textMeasureValid = false;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "fontWeight", {
            get: function () {
                if (this._fontWeight !== undefined)
                    return this._fontWeight;
                else
                    return this.getStyleProperty('fontWeight');
            },
            set: function (fontWeight) {
                if (this._fontWeight !== fontWeight) {
                    this._fontWeight = fontWeight;
                    this.labelDrawing.style.fontWeight = this.fontWeight;
                    this.textMeasureValid = false;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "color", {
            set: function (color) {
                if (this._color !== color) {
                    this._color = Ui.Color.create(color);
                    if (Core.Navigator.supportRgba)
                        this.labelDrawing.style.color = this.getColor().getCssRgba();
                    else
                        this.labelDrawing.style.color = this.getColor().getCssHtml();
                }
            },
            enumerable: true,
            configurable: true
        });
        Label.prototype.getColor = function () {
            if (this._color !== undefined)
                return this._color;
            else
                return Ui.Color.create(this.getStyleProperty('color'));
        };
        Object.defineProperty(Label.prototype, "orientation", {
            get: function () {
                return this._orientation;
            },
            set: function (orientation) {
                if (this._orientation != orientation) {
                    this._orientation = orientation;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Label.prototype.onStyleChange = function () {
            this.labelDrawing.style.fontSize = this.fontSize + 'px';
            this.labelDrawing.style.fontFamily = this.fontFamily;
            this.labelDrawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                this.labelDrawing.style.color = this.getColor().getCssRgba();
            else
                this.labelDrawing.style.color = this.getColor().getCssHtml();
            this.textMeasureValid = false;
            this.invalidateMeasure();
        };
        Label.prototype.renderDrawing = function () {
            this.labelDrawing = document.createElement('div');
            this.labelDrawing.style.whiteSpace = 'nowrap';
            this.labelDrawing.style.display = 'inline';
            this.labelDrawing.style.position = 'absolute';
            this.labelDrawing.style.left = '0px';
            this.labelDrawing.style.top = '0px';
            return this.labelDrawing;
        };
        Label.prototype.measureCore = function (width, height) {
            if (!this.textMeasureValid) {
                this.textMeasureValid = true;
                var size = Ui.Label.measureText(this._text, this.fontSize, this.fontFamily, this.fontWeight);
                this.textWidth = size.width;
                this.textHeight = size.height;
            }
            if (this._orientation === 'vertical')
                return { width: this.textHeight, height: this.textWidth };
            else
                return { width: this.textWidth, height: this.textHeight };
        };
        Label.prototype.arrangeCore = function (width, height) {
            var matrix;
            if (this._orientation == 'vertical') {
                matrix = Ui.Matrix.createTranslate(this.labelDrawing.offsetHeight, 0);
                matrix.rotate(90);
                if (Core.Navigator.isIE) {
                    this.labelDrawing.style.msTransform = matrix.toString();
                    this.labelDrawing.style.msTransformOrigin = '0% 0%';
                }
                else if (Core.Navigator.isGecko) {
                    this.labelDrawing.style.MozTransform = 'matrix(' + matrix.svgMatrix.a.toFixed(4) + ', ' + matrix.svgMatrix.b.toFixed(4) + ', ' + matrix.svgMatrix.c.toFixed(4) + ', ' + matrix.svgMatrix.d.toFixed(4) + ', ' + matrix.svgMatrix.e.toFixed(0) + 'px, ' + matrix.svgMatrix.f.toFixed(0) + 'px)';
                    this.labelDrawing.style.MozTransformOrigin = '0% 0%';
                }
                else if (Core.Navigator.isWebkit) {
                    this.labelDrawing.style.webkitTransform = matrix.toString();
                    this.labelDrawing.style.webkitTransformOrigin = '0% 0%';
                }
                else if (Core.Navigator.isOpera) {
                    this.labelDrawing.style.OTransform = matrix.toString();
                    this.labelDrawing.style.OTransformOrigin = '0% 0%';
                }
            }
            else {
                if (Core.Navigator.isIE && ('removeProperty' in this.labelDrawing))
                    this.labelDrawing.style.removeProperty('-ms-transform');
                else if (Core.Navigator.isGecko)
                    this.labelDrawing.style.removeProperty('-moz-transform');
                else if (Core.Navigator.isWebkit)
                    this.labelDrawing.style.removeProperty('-webkit-transform');
                else if (Core.Navigator.isOpera)
                    this.labelDrawing.style.removeProperty('-o-transform');
            }
        };
        Label.measureTextCanvas = function (text, fontSize, fontFamily, fontWeight) {
            if (Ui.Label.measureBox === undefined)
                this.createMeasureCanvas();
            Ui.Label.measureContext.font = 'normal ' + fontWeight + ' ' + fontSize + 'px ' + fontFamily;
            var res = Ui.Label.measureContext.measureText(text);
            res.height = fontSize;
            return res;
        };
        Label.createMeasureCanvas = function () {
            var measureWindow = window;
            if (Core.Navigator.isIE || Core.Navigator.isGecko)
                measureWindow = Ui.App.getRootWindow();
            if (measureWindow.document.body === undefined) {
                var body = measureWindow.document.createElement('body');
                measureWindow.document.body = body;
            }
            Ui.Label.measureBox = measureWindow.document.createElement('canvas');
            Ui.Label.measureBox.style.visibility = 'hidden';
            Ui.Label.measureBox.style.position = 'absolute';
            Ui.Label.measureBox.style.left = '0px';
            Ui.Label.measureBox.style.top = '0px';
            Ui.Label.measureBox.style.outline = 'none';
            Ui.Label.measureBox.setAttribute('width', 10, null);
            Ui.Label.measureBox.setAttribute('height', 10, null);
            measureWindow.document.body.appendChild(Ui.Label.measureBox);
            Ui.Label.measureContext = Ui.Label.measureBox.getContext('2d');
        };
        Label.isFontAvailable = function (fontFamily, fontWeight) {
            var i;
            if (!Core.Navigator.supportCanvas)
                return true;
            if (Ui.Label.measureBox === undefined)
                Ui.Label.createMeasureCanvas();
            var ctx = Ui.Label.measureContext;
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.clearRect(0, 0, 10, 10);
            ctx.textBaseline = 'top';
            ctx.font = 'normal ' + fontWeight + ' 10px ' + fontFamily;
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.fillText('@', 0, 0);
            var wantedImageData = ctx.getImageData(0, 0, 10, 10);
            var empty = true;
            for (i = 0; empty && (i < wantedImageData.data.length); i += 4) {
                if (wantedImageData.data[i + 3] !== 0)
                    empty = false;
            }
            if (empty)
                return false;
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.clearRect(0, 0, 10, 10);
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.font = 'normal ' + fontWeight + ' 10px Sans-Serif';
            ctx.fillText('@', 0, 0);
            var refImageData = ctx.getImageData(0, 0, 10, 10);
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.clearRect(0, 0, 10, 10);
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.font = 'normal ' + fontWeight + ' 10px ' + fontFamily + ',Sans-Serif';
            ctx.fillText('@', 0, 0);
            var imageData = ctx.getImageData(0, 0, 10, 10);
            for (i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i + 3] !== refImageData.data[i + 3])
                    return true;
            }
            return false;
        };
        Label.measureTextHtml = function (text, fontSize, fontFamily, fontWeight) {
            if (Ui.Label.measureBox === undefined)
                this.createMeasureHtml();
            Ui.Label.measureBox.style.fontSize = fontSize + 'px';
            Ui.Label.measureBox.style.fontFamily = fontFamily;
            Ui.Label.measureBox.style.fontWeight = fontWeight;
            if ('textContent' in Ui.Label.measureBox)
                Ui.Label.measureBox.textContent = text;
            else
                Ui.Label.measureBox.innerText = text;
            return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
        };
        Label.createMeasureHtml = function () {
            var measureWindow = window;
            if (Core.Navigator.isIE || Core.Navigator.isGecko)
                measureWindow = Ui.App.getRootWindow();
            if (measureWindow.document.body === undefined) {
                var body = measureWindow.document.createElement('body');
                measureWindow.document.body = body;
            }
            Ui.Label.measureBox = measureWindow.document.createElement('div');
            Ui.Label.measureBox.style.whiteSpace = 'nowrap';
            Ui.Label.measureBox.style.position = 'absolute';
            Ui.Label.measureBox.style.left = '0px';
            Ui.Label.measureBox.style.top = '0px';
            Ui.Label.measureBox.style.position = 'absolute';
            Ui.Label.measureBox.style.display = 'inline';
            Ui.Label.measureBox.style.visibility = 'hidden';
            measureWindow.document.body.appendChild(Ui.Label.measureBox);
        };
        Label.measureText = function (text, fontSize, fontFamily, fontWeight) {
            if ((text === '') || (text === undefined))
                return { width: 0, height: 0 };
            if (Core.Navigator.supportCanvas)
                return Ui.Label.measureTextCanvas(text, fontSize, fontFamily, fontWeight);
            else
                return Ui.Label.measureTextHtml(text, fontSize, fontFamily, fontWeight);
        };
        Label.measureBox = undefined;
        Label.measureContext = undefined;
        Label.style = {
            color: Ui.Color.create('#444444'),
            fontSize: 16,
            fontFamily: 'Sans-serif',
            fontWeight: 'normal'
        };
        return Label;
    }(Ui.Element));
    Ui.Label = Label;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var MovableBase = (function (_super) {
        __extends(MovableBase, _super);
        function MovableBase(init) {
            var _this = _super.call(this) || this;
            _this._moveHorizontal = true;
            _this._moveVertical = true;
            _this.posX = 0;
            _this.posY = 0;
            _this.speedX = 0;
            _this.speedY = 0;
            _this.startPosX = undefined;
            _this.startPosY = undefined;
            _this.inertiaClock = undefined;
            _this._inertia = false;
            _this._isDown = false;
            _this._lock = false;
            _this.isInMoveEvent = false;
            _this.cumulMove = 0;
            _this.addEvents('down', 'up', 'move');
            _this.connect(_this, 'ptrdown', _this.onPointerDown);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(MovableBase.prototype, "lock", {
            get: function () {
                return this._lock;
            },
            set: function (lock) {
                this._lock = lock;
                if (lock)
                    this.stopInertia();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovableBase.prototype, "isDown", {
            get: function () {
                return this._isDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovableBase.prototype, "inertia", {
            get: function () {
                return this._inertia;
            },
            set: function (inertiaActive) {
                this._inertia = inertiaActive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovableBase.prototype, "moveHorizontal", {
            get: function () {
                return this._moveHorizontal;
            },
            set: function (moveHorizontal) {
                this._moveHorizontal = moveHorizontal;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovableBase.prototype, "moveVertical", {
            get: function () {
                return this._moveVertical;
            },
            set: function (moveVertical) {
                this._moveVertical = moveVertical;
            },
            enumerable: true,
            configurable: true
        });
        MovableBase.prototype.setPosition = function (x, y, dontSignal) {
            if (dontSignal === void 0) { dontSignal = false; }
            if ((x !== undefined) && (this._moveHorizontal)) {
                if (isNaN(x))
                    this.posX = 0;
                else
                    this.posX = x;
            }
            if ((y !== undefined) && (this._moveVertical)) {
                if (isNaN(y))
                    this.posY = 0;
                else
                    this.posY = y;
            }
            if (!this.isInMoveEvent && !dontSignal) {
                this.isInMoveEvent = true;
                this.fireEvent('move', this);
                this.onMove(this.posX, this.posY);
                this.isInMoveEvent = false;
            }
        };
        Object.defineProperty(MovableBase.prototype, "positionX", {
            get: function () {
                return this.posX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovableBase.prototype, "positionY", {
            get: function () {
                return this.posY;
            },
            enumerable: true,
            configurable: true
        });
        MovableBase.prototype.onMove = function (x, y) {
        };
        MovableBase.prototype.onDown = function () {
            this.cumulMove = 0;
            this._isDown = true;
            this.fireEvent('down', this);
        };
        MovableBase.prototype.onUp = function (abort) {
            this._isDown = false;
            this.fireEvent('up', this, this.speedX, this.speedY, (this.posX - this.startPosX), (this.posY - this.startPosY), this.cumulMove, abort);
        };
        MovableBase.prototype.onPointerDown = function (event) {
            if (this._isDown || this.isDisabled || this._lock)
                return;
            this.stopInertia();
            this.startPosX = this.posX;
            this.startPosY = this.posY;
            this.onDown();
            var watcher = event.pointer.watch(this);
            this.connect(watcher, 'move', function () {
                if (!watcher.getIsCaptured()) {
                    if (watcher.pointer.getIsMove()) {
                        var deltaObj = watcher.getDelta();
                        var delta = Math.sqrt(deltaObj.x * deltaObj.x + deltaObj.y * deltaObj.y);
                        this.setPosition(this.startPosX + deltaObj.x, this.startPosY + deltaObj.y);
                        var deltaPosX = this.posX - this.startPosX;
                        var deltaPosY = this.posY - this.startPosY;
                        var deltaPos = Math.sqrt(deltaPosX * deltaPosX + deltaPosY * deltaPosY);
                        var test = 0;
                        if (delta > 0)
                            test = deltaPos / delta;
                        if (test > 0.7)
                            watcher.capture();
                        else {
                            this.setPosition(this.startPosX, this.startPosY);
                            watcher.cancel();
                        }
                    }
                }
                else {
                    var delta = watcher.getDelta();
                    this.setPosition(this.startPosX + delta.x, this.startPosY + delta.y);
                }
            });
            this.connect(watcher, 'up', function () {
                this.cumulMove = watcher.pointer.getCumulMove();
                var speed = watcher.getSpeed();
                this.speedX = speed.x;
                this.speedY = speed.y;
                if (this.inertia)
                    this.startInertia();
                this.onUp(false);
                watcher.cancel();
            });
            this.connect(watcher, 'cancel', function () {
                this.onUp(true);
            });
        };
        MovableBase.prototype.startInertia = function () {
            if (this.inertiaClock == undefined) {
                this.inertiaClock = new Anim.Clock();
                this.inertiaClock.duration = 'forever';
                this.inertiaClock.target = this;
                this.connect(this.inertiaClock, 'timeupdate', function (clock, progress, delta) {
                    if (delta === 0)
                        return;
                    var oldPosX = this.posX;
                    var oldPosY = this.posY;
                    var posX = this.posX + (this.speedX * delta);
                    var posY = this.posY + (this.speedY * delta);
                    this.setPosition(posX, posY);
                    if ((this.posX == oldPosX) && (this.posY == oldPosY)) {
                        this.stopInertia();
                        return;
                    }
                    this.speedX -= this.speedX * delta * 3;
                    this.speedY -= this.speedY * delta * 3;
                    if (Math.abs(this.speedX) < 0.1)
                        this.speedX = 0;
                    if (Math.abs(this.speedY) < 0.1)
                        this.speedY = 0;
                    if ((this.speedX === 0) && (this.speedY === 0))
                        this.stopInertia();
                });
                this.inertiaClock.begin();
            }
        };
        MovableBase.prototype.stopInertia = function () {
            if (this.inertiaClock !== undefined) {
                this.inertiaClock.stop();
                this.inertiaClock = undefined;
            }
        };
        return MovableBase;
    }(Ui.Container));
    Ui.MovableBase = MovableBase;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Movable = (function (_super) {
        __extends(Movable, _super);
        function Movable(init) {
            var _this = _super.call(this) || this;
            _this.contentBox = undefined;
            _this._cursor = 'inherit';
            _this.focusable = true;
            _this.contentBox = new Ui.LBox();
            _this.appendChild(_this.contentBox);
            _this.contentBox.drawing.style.cursor = _this._cursor;
            _this.connect(_this.drawing, 'keydown', _this.onKeyDown);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Movable.prototype, "cursor", {
            set: function (cursor) {
                if (this._cursor != cursor && !this.isDisabled) {
                    this._cursor = cursor;
                    this.contentBox.drawing.style.cursor = this._cursor;
                }
            },
            enumerable: true,
            configurable: true
        });
        Movable.prototype.onKeyDown = function (event) {
            if (this.isDisabled)
                return;
            var key = event.which;
            if (((key == 37) || (key == 39)) && this.moveHorizontal) {
                event.preventDefault();
                event.stopPropagation();
                if (key == 37)
                    this.setPosition(this.posX - 10, undefined);
                if (key == 39)
                    this.setPosition(this.posX + 10, undefined);
            }
            if (((key == 38) || (key == 40)) && this.moveVertical) {
                event.preventDefault();
                event.stopPropagation();
                if (key == 38)
                    this.setPosition(undefined, this.posY - 10);
                if (key == 40)
                    this.setPosition(undefined, this.posY + 10);
            }
        };
        Movable.prototype.onMove = function (x, y) {
            this.contentBox.transform = Ui.Matrix.createTranslate(this.posX, this.posY);
        };
        Movable.prototype.measureCore = function (width, height) {
            return this.contentBox.measure(width, height);
        };
        Movable.prototype.arrangeCore = function (width, height) {
            this.drawing.style.width = '1px';
            this.drawing.style.height = '1px';
            this.contentBox.arrange(0, 0, width, height);
        };
        Movable.prototype.getContent = function () {
            return this.contentBox.firstChild;
        };
        Movable.prototype.setContent = function (content) {
            this.contentBox.content = content;
        };
        Movable.prototype.onDisable = function () {
            this.contentBox.drawing.style.cursor = 'inherit';
        };
        Movable.prototype.onEnable = function () {
            this.contentBox.drawing.style.cursor = this._cursor;
        };
        return Movable;
    }(Ui.MovableBase));
    Ui.Movable = Movable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Transformable = (function (_super) {
        __extends(Transformable, _super);
        function Transformable() {
            var _this = _super.call(this) || this;
            _this._inertia = false;
            _this._isDown = false;
            _this.transformLock = false;
            _this._angle = 0;
            _this._scale = 1;
            _this._translateX = 0;
            _this._translateY = 0;
            _this.startAngle = 0;
            _this.startScale = 0;
            _this.startTranslateX = 0;
            _this.startTranslateY = 0;
            _this._allowScale = true;
            _this._minScale = 0.1;
            _this._maxScale = 10;
            _this._allowRotate = true;
            _this._allowTranslate = true;
            _this.speedX = 0;
            _this.speedY = 0;
            _this.addEvents('down', 'up', 'transform', 'inertiastart', 'inertiaend');
            _this.focusable = true;
            _this.contentBox = new Ui.LBox();
            _this.contentBox.setTransformOrigin(0, 0, true);
            _this.appendChild(_this.contentBox);
            _this.connect(_this, 'ptrdown', _this.onPointerDown);
            _this.connect(_this, 'wheel', _this.onWheel);
            return _this;
        }
        Object.defineProperty(Transformable.prototype, "allowScale", {
            set: function (allow) {
                this._allowScale = allow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "minScale", {
            set: function (minScale) {
                this._minScale = minScale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "maxScale", {
            set: function (maxScale) {
                this._maxScale = maxScale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "allowRotate", {
            set: function (allow) {
                this._allowRotate = allow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "allowTranslate", {
            set: function (allow) {
                this._allowTranslate = allow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "isDown", {
            get: function () {
                return this._isDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "isInertia", {
            get: function () {
                return this.inertiaClock !== undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "angle", {
            get: function () {
                return this._angle;
            },
            set: function (angle) {
                this.setContentTransform(undefined, undefined, undefined, angle);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            set: function (scale) {
                this.setContentTransform(undefined, undefined, scale, undefined);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "translateX", {
            get: function () {
                return this._translateX;
            },
            set: function (translateX) {
                this.setContentTransform(translateX, undefined, undefined, undefined);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transformable.prototype, "translateY", {
            get: function () {
                return this._translateY;
            },
            set: function (translateY) {
                this.setContentTransform(undefined, translateY, undefined, undefined);
            },
            enumerable: true,
            configurable: true
        });
        Transformable.prototype.buildMatrix = function (translateX, translateY, scale, angle) {
            if (translateX === undefined)
                translateX = this._translateX;
            if (translateY === undefined)
                translateY = this._translateY;
            if (scale === undefined)
                scale = this._scale;
            if (angle === undefined)
                angle = this._angle;
            return Ui.Matrix.createTranslate(this.layoutWidth * this.transformOriginX, this.layoutHeight * this.transformOriginX).
                translate(translateX, translateY).
                scale(scale, scale).
                rotate(angle).
                translate(-this.layoutWidth * this.transformOriginX, -this.layoutHeight * this.transformOriginX);
        };
        Object.defineProperty(Transformable.prototype, "matrix", {
            get: function () {
                return Ui.Matrix.createTranslate(this.layoutWidth * this.transformOriginX, this.layoutHeight * this.transformOriginX).
                    translate(this._translateX, this._translateY).
                    scale(this._scale, this._scale).
                    rotate(this._angle).
                    translate(-this.layoutWidth * this.transformOriginX, -this.layoutHeight * this.transformOriginX);
            },
            enumerable: true,
            configurable: true
        });
        Transformable.prototype.getBoundaryBox = function (matrix) {
            if (matrix === undefined)
                matrix = this.matrix;
            var p1 = (new Ui.Point(0, 0)).multiply(matrix);
            var p2 = (new Ui.Point(this.layoutWidth, 0)).multiply(matrix);
            var p3 = (new Ui.Point(this.layoutWidth, this.layoutHeight)).multiply(matrix);
            var p4 = (new Ui.Point(0, this.layoutHeight)).multiply(matrix);
            var minX = Math.min(p1.x, Math.min(p2.x, Math.min(p3.x, p4.x)));
            var minY = Math.min(p1.y, Math.min(p2.y, Math.min(p3.y, p4.y)));
            var maxX = Math.max(p1.x, Math.max(p2.x, Math.max(p3.x, p4.x)));
            var maxY = Math.max(p1.y, Math.max(p2.y, Math.max(p3.y, p4.y)));
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        };
        Transformable.prototype.setContentTransform = function (translateX, translateY, scale, angle) {
            if (translateX === undefined)
                translateX = this._translateX;
            if (translateY === undefined)
                translateY = this._translateY;
            if (scale === undefined)
                scale = this._scale;
            if (angle === undefined)
                angle = this._angle;
            this._translateX = translateX;
            this._translateY = translateY;
            this._scale = scale;
            this._angle = angle;
            if (!this.transformLock) {
                this.transformLock = true;
                this.fireEvent('transform', this);
                var testOnly = !(((this.watcher1 === undefined) || this.watcher1.getIsCaptured()) &&
                    ((this.watcher2 === undefined) || this.watcher2.getIsCaptured()));
                this.onContentTransform(testOnly);
                this.transformLock = false;
            }
        };
        Object.defineProperty(Transformable.prototype, "inertia", {
            get: function () {
                return this._inertia;
            },
            set: function (inertiaActive) {
                this._inertia = inertiaActive;
            },
            enumerable: true,
            configurable: true
        });
        Transformable.prototype.onContentTransform = function (testOnly) {
            if (testOnly === void 0) { testOnly = false; }
            if (testOnly !== true)
                this.contentBox.transform = this.matrix;
        };
        Transformable.prototype.onDown = function () {
            this._isDown = true;
            this.fireEvent('down', this);
        };
        Transformable.prototype.onUp = function () {
            this._isDown = false;
            this.fireEvent('up', this);
        };
        Transformable.prototype.onPointerDown = function (event) {
            this.stopInertia();
            if (this.watcher1 === undefined) {
                if (this._allowTranslate)
                    this.onDown();
                var watcher = event.pointer.watch(this);
                this.watcher1 = watcher;
                this.connect(watcher, 'move', this.onPointerMove);
                this.connect(watcher, 'up', this.onPointerUp);
                this.connect(watcher, 'cancel', this.onPointerCancel);
                this.startAngle = this._angle;
                this.startScale = this._scale;
                this.startTranslateX = this._translateX;
                this.startTranslateY = this._translateY;
            }
            else if (this.watcher2 === undefined) {
                if (!this._allowTranslate)
                    this.onDown();
                this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());
                var watcher = event.pointer.watch(this);
                this.watcher2 = watcher;
                this.connect(watcher, 'move', this.onPointerMove);
                this.connect(watcher, 'up', this.onPointerUp);
                this.connect(watcher, 'cancel', this.onPointerUp);
                this.startAngle = this._angle;
                this.startScale = this._scale;
                this.startTranslateX = this._translateX;
                this.startTranslateY = this._translateY;
            }
        };
        Transformable.prototype.onPointerMove = function (watcher) {
            var pos1;
            var pos2;
            var start1;
            var start2;
            if ((this.watcher1 !== undefined) && (this.watcher2 !== undefined)) {
                if (!this.watcher1.getIsCaptured() && this.watcher1.pointer.getIsMove())
                    this.watcher1.capture();
                if (!this.watcher2.getIsCaptured() && this.watcher2.pointer.getIsMove())
                    this.watcher2.capture();
                pos1 = this.pointFromWindow(new Ui.Point(this.watcher1.pointer.getX(), this.watcher1.pointer.getY()));
                pos2 = this.pointFromWindow(new Ui.Point(this.watcher2.pointer.getX(), this.watcher2.pointer.getY()));
                start1 = this.pointFromWindow(new Ui.Point(this.watcher1.pointer.getInitialX(), this.watcher1.pointer.getInitialY()));
                start2 = this.pointFromWindow(new Ui.Point(this.watcher2.pointer.getInitialX(), this.watcher2.pointer.getInitialY()));
                var startVector = { x: start2.x - start1.x, y: start2.y - start1.y };
                var endVector = { x: pos2.x - pos1.x, y: pos2.y - pos1.y };
                startVector.norm = Math.sqrt((startVector.x * startVector.x) + (startVector.y * startVector.y));
                endVector.norm = Math.sqrt((endVector.x * endVector.x) + (endVector.y * endVector.y));
                var scale = endVector.norm / startVector.norm;
                startVector.x /= startVector.norm;
                startVector.y /= startVector.norm;
                endVector.x /= endVector.norm;
                endVector.y /= endVector.norm;
                var divVector = {
                    x: (startVector.x * endVector.x + startVector.y * endVector.y),
                    y: (startVector.y * endVector.x - startVector.x * endVector.y)
                };
                var angle = -(Math.atan2(divVector.y, divVector.x) * 180.0) / Math.PI;
                var deltaMatrix = Ui.Matrix.createTranslate(pos1.x - start1.x, pos1.y - start1.y).translate(start1.x, start1.y);
                if (this._allowScale) {
                    if ((this._minScale !== undefined) || (this._maxScale !== undefined)) {
                        var totalScale = this.startScale * scale;
                        if ((this._minScale !== undefined) && (totalScale < this._minScale))
                            totalScale = this._minScale;
                        if ((this._maxScale !== undefined) && (totalScale > this._maxScale))
                            totalScale = this._maxScale;
                        scale = totalScale / this.startScale;
                    }
                    deltaMatrix = deltaMatrix.scale(scale, scale);
                }
                else
                    scale = 1;
                if (this._allowRotate)
                    deltaMatrix = deltaMatrix.rotate(angle);
                else
                    angle = 0;
                deltaMatrix = deltaMatrix.translate(-start1.x, -start1.y);
                var origin = new Ui.Point(this.layoutWidth * this.transformOriginX, this.layoutHeight * this.transformOriginX);
                deltaMatrix = deltaMatrix.translate(origin.x, origin.y).
                    translate(this.startTranslateX, this.startTranslateY).
                    scale(this.startScale, this.startScale).
                    rotate(this.startAngle).
                    translate(-origin.x, -origin.y);
                origin = origin.multiply(deltaMatrix);
                this.setContentTransform(origin.x - this.layoutWidth * this.transformOriginX, origin.y - this.layoutHeight * this.transformOriginY, this.startScale * scale, this.startAngle + angle);
            }
            else if ((this.watcher1 !== undefined) && this._allowTranslate) {
                pos1 = this.pointFromWindow(new Ui.Point(this.watcher1.pointer.getX(), this.watcher1.pointer.getY()));
                start1 = this.pointFromWindow(new Ui.Point(this.watcher1.pointer.getInitialX(), this.watcher1.pointer.getInitialY()));
                var deltaX = pos1.x - start1.x;
                var deltaY = pos1.y - start1.y;
                var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                this.setContentTransform(this.startTranslateX + (pos1.x - start1.x), this.startTranslateY + (pos1.y - start1.y), this.startScale, this.startAngle);
                var takenDeltaX = (this._translateX - this.startTranslateX);
                var takenDeltaY = (this._translateY - this.startTranslateY);
                var takenDelta = Math.sqrt(takenDeltaX * takenDeltaX + takenDeltaY * takenDeltaY);
                var test = 0;
                if (delta > 0)
                    test = (takenDelta / delta);
                if (!this.watcher1.getIsCaptured() && this.watcher1.pointer.getIsMove() && (test > 0.7))
                    this.watcher1.capture();
            }
        };
        Transformable.prototype.onPointerCancel = function (watcher) {
            this.onPointerUp(watcher);
            this.stopInertia();
            this._angle = this.startAngle;
            this._scale = this.startScale;
            this._translateX = this.startTranslateX;
            this._translateY = this.startTranslateY;
        };
        Transformable.prototype.onPointerUp = function (watcher) {
            if ((this.watcher1 !== undefined) && (this.watcher1 === watcher)) {
                if (this.watcher2 !== undefined) {
                    this.watcher1 = this.watcher2;
                    delete (this.watcher2);
                    this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());
                    this.startAngle = this._angle;
                    this.startScale = this._scale;
                    this.startTranslateX = this._translateX;
                    this.startTranslateY = this._translateY;
                    if (!this._allowTranslate)
                        this.onUp();
                }
                else {
                    if (this._allowTranslate)
                        this.onUp();
                    var speed = this.watcher1.getSpeed();
                    this.speedX = speed.x;
                    this.speedY = speed.y;
                    delete (this.watcher1);
                    this.startInertia();
                }
            }
            if ((this.watcher2 !== undefined) && (this.watcher2 === watcher)) {
                delete (this.watcher2);
                this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());
                this.startAngle = this._angle;
                this.startScale = this._scale;
                this.startTranslateX = this._translateX;
                this.startTranslateY = this._translateY;
                if (!this._allowTranslate)
                    this.onUp();
            }
        };
        Transformable.prototype.onWheel = function (event) {
            var delta = 0;
            delta = event.deltaX + event.deltaY;
            if (event.altKey) {
                if (this._allowRotate) {
                    var angle = delta / 5;
                    var pos = this.pointFromWindow(new Ui.Point(event.clientX, event.clientY));
                    var origin = new Ui.Point(this.layoutWidth * this.transformOriginX, this.layoutHeight * this.transformOriginX);
                    var deltaMatrix = Ui.Matrix.createTranslate(pos.x, pos.y).
                        rotate(angle).
                        translate(-pos.x, -pos.y).
                        translate(origin.x, origin.y).
                        translate(this._translateX, this._translateY).
                        scale(this._scale, this._scale).
                        rotate(this._angle).
                        translate(-origin.x, -origin.y);
                    origin = origin.multiply(deltaMatrix);
                    this.setContentTransform(origin.x - this.layoutWidth * this.transformOriginX, origin.y - this.layoutHeight * this.transformOriginY, this._scale, this._angle + angle);
                }
            }
            else if (event.ctrlKey) {
                if (this._allowScale) {
                    var scale = Math.pow(2, (Math.log(this._scale) / Math.log(2)) - delta / 60);
                    if ((this._minScale !== undefined) && (scale < this._minScale))
                        scale = this._minScale;
                    if ((this._maxScale !== undefined) && (scale > this._maxScale))
                        scale = this._maxScale;
                    var deltaScale = scale / this._scale;
                    var pos = this.pointFromWindow(new Ui.Point(event.clientX, event.clientY));
                    var origin = new Ui.Point(this.layoutWidth * this.transformOriginX, this.layoutHeight * this.transformOriginX);
                    var deltaMatrix = Ui.Matrix.createTranslate(pos.x, pos.y).
                        scale(deltaScale, deltaScale).
                        translate(-pos.x, -pos.y).
                        translate(origin.x, origin.y).
                        translate(this._translateX, this._translateY).
                        scale(this._scale, this._scale).
                        rotate(this._angle).
                        translate(-origin.x, -origin.y);
                    origin = origin.multiply(deltaMatrix);
                    this.setContentTransform(origin.x - this.layoutWidth * this.transformOriginX, origin.y - this.layoutHeight * this.transformOriginY, scale, this._angle);
                }
            }
            else
                return;
            event.stopPropagation();
        };
        Transformable.prototype.startInertia = function () {
            if ((this.inertiaClock === undefined) && this.inertia) {
                this.inertiaClock = new Anim.Clock({ duration: 'forever', target: this });
                this.connect(this.inertiaClock, 'timeupdate', this.onTimeupdate);
                this.inertiaClock.begin();
                this.fireEvent('inertiastart', this);
            }
        };
        Transformable.prototype.onTimeupdate = function (clock, progress, delta) {
            if (delta === 0)
                return;
            var oldTranslateX = this._translateX;
            var oldTranslateY = this._translateY;
            var translateX = this._translateX + (this.speedX * delta);
            var translateY = this._translateY + (this.speedY * delta);
            this.setContentTransform(translateX, translateY, undefined, undefined);
            if ((this._translateX === oldTranslateX) && (this._translateY === oldTranslateY)) {
                this.stopInertia();
                return;
            }
            this.speedX -= this.speedX * delta * 3;
            this.speedY -= this.speedY * delta * 3;
            if (Math.abs(this.speedX) < 0.1)
                this.speedX = 0;
            if (Math.abs(this.speedY) < 0.1)
                this.speedY = 0;
            if ((this.speedX === 0) && (this.speedY === 0))
                this.stopInertia();
        };
        Transformable.prototype.stopInertia = function () {
            if (this.inertiaClock !== undefined) {
                this.inertiaClock.stop();
                delete (this.inertiaClock);
                this.setContentTransform(Math.round(this._translateX), Math.round(this._translateY), undefined, undefined);
                this.fireEvent('inertiaend', this);
            }
        };
        Object.defineProperty(Transformable.prototype, "content", {
            get: function () {
                return this.contentBox.firstChild;
            },
            set: function (content) {
                this.contentBox.content = content;
            },
            enumerable: true,
            configurable: true
        });
        Transformable.prototype.arrangeCore = function (width, height) {
            _super.prototype.arrangeCore.call(this, width, height);
            this.onContentTransform();
        };
        return Transformable;
    }(Ui.LBox));
    Ui.Transformable = Transformable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Scrollable = (function (_super) {
        __extends(Scrollable, _super);
        function Scrollable(init) {
            var _this = _super.call(this) || this;
            _this.contentBox = undefined;
            _this._scrollHorizontal = true;
            _this._scrollVertical = true;
            _this.showShadows = false;
            _this.lock = false;
            _this.isOver = false;
            _this.showClock = undefined;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.relativeOffsetX = 0;
            _this.relativeOffsetY = 0;
            _this.viewWidth = 0;
            _this.viewHeight = 0;
            _this.contentWidth = 0;
            _this.contentHeight = 0;
            _this.overWatcher = undefined;
            _this.scrollLock = false;
            _this.scrollbarVerticalNeeded = false;
            _this.scrollbarHorizontalNeeded = false;
            _this.scrollbarVerticalHeight = 0;
            _this.scrollbarHorizontalWidth = 0;
            _this.addEvents('scroll');
            _this.contentBox = new Ui.ScrollableContent();
            _this.connect(_this.contentBox, 'scroll', _this.onScroll);
            _this.connect(_this.contentBox, 'down', _this.autoShowScrollbars);
            _this.connect(_this.contentBox, 'inertiaend', _this.autoHideScrollbars);
            _this.appendChild(_this.contentBox);
            _this.connect(_this, 'ptrmove', function (event) {
                if (!_this.isDisabled && !event.pointer.getIsDown() && (_this.overWatcher === undefined)) {
                    _this.overWatcher = event.pointer.watch(_this);
                    _this.isOver = true;
                    _this.autoShowScrollbars();
                    _this.connect(_this.overWatcher, 'move', function () {
                        if (!_this.overWatcher.getIsInside())
                            _this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'down', function () {
                        _this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'up', function () {
                        _this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'cancel', function () {
                        _this.overWatcher = undefined;
                        _this.isOver = false;
                        _this.autoHideScrollbars();
                    });
                }
            });
            _this.connect(_this, 'wheel', _this.onWheel);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Scrollable.prototype, "maxScale", {
            set: function (maxScale) {
                this.contentBox.maxScale = maxScale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollable.prototype, "content", {
            get: function () {
                return this.contentBox.content;
            },
            set: function (content) {
                this.setContent(content);
            },
            enumerable: true,
            configurable: true
        });
        Scrollable.prototype.setContent = function (content) {
            this.contentBox.content = content;
        };
        Object.defineProperty(Scrollable.prototype, "inertia", {
            get: function () {
                return this.contentBox.inertia;
            },
            set: function (inertiaActive) {
                this.contentBox.inertia = inertiaActive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollable.prototype, "scrollHorizontal", {
            get: function () {
                return this._scrollHorizontal;
            },
            set: function (scroll) {
                if (scroll !== this._scrollHorizontal) {
                    this._scrollHorizontal = scroll;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollable.prototype, "scrollVertical", {
            get: function () {
                return this._scrollVertical;
            },
            set: function (scroll) {
                if (scroll !== this._scrollVertical) {
                    this._scrollVertical = scroll;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Scrollable.prototype.setScrollbarVertical = function (scrollbarVertical) {
            if (this.scrollbarVerticalBox) {
                this.disconnect(this.scrollbarVerticalBox, 'down', this.autoShowScrollbars);
                this.disconnect(this.scrollbarVerticalBox, 'up', this.autoHideScrollbars);
                this.disconnect(this.scrollbarVerticalBox, 'move', this.onScrollbarVerticalMove);
                this.removeChild(this.scrollbarVerticalBox);
            }
            if (scrollbarVertical) {
                this.scrollbarVerticalBox = scrollbarVertical;
                this.scrollbarVerticalBox.opacity = 0;
                this.scrollbarVerticalBox.moveHorizontal = false;
                this.connect(this.scrollbarVerticalBox, 'down', this.autoShowScrollbars);
                this.connect(this.scrollbarVerticalBox, 'up', this.autoHideScrollbars);
                this.connect(this.scrollbarVerticalBox, 'move', this.onScrollbarVerticalMove);
                this.appendChild(this.scrollbarVerticalBox);
            }
        };
        Scrollable.prototype.setScrollbarHorizontal = function (scrollbarHorizontal) {
            if (this.scrollbarHorizontalBox) {
                this.disconnect(this.scrollbarHorizontalBox, 'down', this.autoShowScrollbars);
                this.disconnect(this.scrollbarHorizontalBox, 'up', this.autoHideScrollbars);
                this.disconnect(this.scrollbarHorizontalBox, 'move', this.onScrollbarHorizontalMove);
                this.removeChild(this.scrollbarHorizontalBox);
            }
            if (scrollbarHorizontal) {
                this.scrollbarHorizontalBox = scrollbarHorizontal;
                this.scrollbarHorizontalBox.opacity = 0;
                this.scrollbarHorizontalBox.moveVertical = false;
                this.connect(this.scrollbarHorizontalBox, 'down', this.autoShowScrollbars);
                this.connect(this.scrollbarHorizontalBox, 'up', this.autoHideScrollbars);
                this.connect(this.scrollbarHorizontalBox, 'move', this.onScrollbarHorizontalMove);
                this.appendChild(this.scrollbarHorizontalBox);
            }
        };
        Scrollable.prototype.setOffset = function (offsetX, offsetY, absolute) {
            if (absolute === void 0) { absolute = false; }
            if (absolute === undefined)
                absolute = false;
            if (offsetX === undefined)
                offsetX = this.offsetX;
            else if (!absolute)
                offsetX *= this.contentWidth - this.viewWidth;
            if (offsetY === undefined)
                offsetY = this.offsetY;
            else if (!absolute)
                offsetY *= this.contentHeight - this.viewHeight;
            if (offsetX < 0)
                offsetX = 0;
            else if (this.viewWidth + offsetX > this.contentWidth)
                offsetX = this.contentWidth - this.viewWidth;
            if (offsetY < 0)
                offsetY = 0;
            else if (this.viewHeight + offsetY > this.contentHeight)
                offsetY = this.contentHeight - this.viewHeight;
            if (this.contentWidth <= this.viewWidth)
                this.relativeOffsetX = 0;
            else
                this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
            if (this.contentHeight <= this.viewHeight)
                this.relativeOffsetY = 0;
            else
                this.relativeOffsetY = offsetY / (this.contentHeight - this.viewHeight);
            if ((this.offsetX !== offsetX) || (this.offsetY !== offsetY)) {
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.contentBox.setOffset(offsetX, offsetY);
                return true;
            }
            else
                return false;
        };
        Scrollable.prototype.getOffsetX = function () {
            return this.contentBox.offsetX;
        };
        Scrollable.prototype.getRelativeOffsetX = function () {
            return this.relativeOffsetX;
        };
        Scrollable.prototype.getOffsetY = function () {
            return this.contentBox.offsetY;
        };
        Scrollable.prototype.getRelativeOffsetY = function () {
            return this.relativeOffsetY;
        };
        Object.defineProperty(Scrollable.prototype, "scale", {
            get: function () {
                return this.contentBox.scale;
            },
            set: function (scale) {
                this.contentBox.scale = scale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollable.prototype, "isDown", {
            get: function () {
                return this.contentBox.isDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollable.prototype, "isInertia", {
            get: function () {
                return this.contentBox.isInertia;
            },
            enumerable: true,
            configurable: true
        });
        Scrollable.prototype.onWheel = function (event) {
            if (this.setOffset(this.contentBox.offsetX + event.deltaX * 3, this.contentBox.offsetY + event.deltaY * 3, true)) {
                event.stopPropagation();
            }
        };
        Scrollable.prototype.autoShowScrollbars = function () {
            if (this.showClock === undefined) {
                this.showClock = new Anim.Clock({ duration: 'forever' });
                this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
                this.showClock.begin();
            }
        };
        Scrollable.prototype.autoHideScrollbars = function () {
            if (this.contentBox.isDown || this.contentBox.isInertia || this.isOver)
                return;
            if (this.showClock === undefined) {
                this.showClock = new Anim.Clock({ duration: 'forever' });
                this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
                this.showClock.begin();
            }
        };
        Scrollable.prototype.onShowBarsTick = function (clock, progress, delta) {
            var show = this.contentBox.isDown || this.contentBox.isInertia || this.isOver;
            if (this.scrollbarVerticalBox)
                show = show || this.scrollbarVerticalBox.isDown;
            if (this.scrollbarHorizontalBox)
                show = show || this.scrollbarHorizontalBox.isDown;
            var stop = false;
            var speed = 2;
            var opacity = this.scrollbarHorizontalBox.opacity;
            if (show) {
                opacity += (delta * speed);
                if (opacity >= 1) {
                    opacity = 1;
                    stop = true;
                }
            }
            else {
                opacity -= (delta * speed);
                if (opacity <= 0) {
                    opacity = 0;
                    stop = true;
                }
            }
            if (this.scrollbarHorizontalBox)
                this.scrollbarHorizontalBox.opacity = opacity;
            if (this.scrollbarVerticalBox)
                this.scrollbarVerticalBox.opacity = opacity;
            if (stop) {
                this.showClock.stop();
                this.showClock = undefined;
            }
        };
        Scrollable.prototype.onScroll = function () {
            this.updateOffset();
            this.fireEvent('scroll', this, this.offsetX, this.offsetY);
        };
        Scrollable.prototype.updateOffset = function () {
            if (this.contentBox === undefined)
                return;
            this.offsetX = this.contentBox.offsetX;
            this.offsetY = this.contentBox.offsetY;
            this.viewWidth = this.layoutWidth;
            this.viewHeight = this.layoutHeight;
            this.contentWidth = this.contentBox.contentWidth;
            this.contentHeight = this.contentBox.contentHeight;
            if (this.contentWidth <= this.viewWidth)
                this.relativeOffsetX = 0;
            else
                this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
            if (this.contentHeight <= this.viewHeight)
                this.relativeOffsetY = 0;
            else
                this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
            if (this.contentHeight > this.viewHeight)
                this.scrollbarVerticalNeeded = true;
            else
                this.scrollbarVerticalNeeded = false;
            if (this.contentWidth > this.viewWidth)
                this.scrollbarHorizontalNeeded = true;
            else
                this.scrollbarHorizontalNeeded = false;
            if (this.scrollbarVerticalNeeded) {
                if (this.scrollbarVerticalBox) {
                    this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVerticalBox.measureHeight);
                    this.scrollbarVerticalBox.arrange(this.layoutWidth - this.scrollbarVerticalBox.measureWidth, 0, this.scrollbarVerticalBox.measureWidth, this.scrollbarVerticalHeight);
                    this.scrollbarVerticalBox.show();
                }
            }
            else {
                if (this.scrollbarVerticalBox)
                    this.scrollbarVerticalBox.hide();
                this.offsetY = 0;
            }
            if (this.scrollbarHorizontalNeeded) {
                if (this.scrollbarHorizontalBox) {
                    this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontalBox.measureWidth);
                    this.scrollbarHorizontalBox.arrange(0, this.layoutHeight - this.scrollbarHorizontalBox.measureHeight, this.scrollbarHorizontalWidth, this.scrollbarHorizontalBox.measureHeight);
                    this.scrollbarHorizontalBox.show();
                }
            }
            else {
                if (this.scrollbarHorizontalBox)
                    this.scrollbarHorizontalBox.hide();
                this.offsetX = 0;
            }
            this.scrollLock = true;
            if (this.scrollbarHorizontalNeeded) {
                var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
                if (relOffsetX > 1) {
                    relOffsetX = 1;
                    this.setOffset(relOffsetX, undefined);
                }
                if (this.scrollbarHorizontalBox)
                    this.scrollbarHorizontalBox.setPosition((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, undefined);
            }
            if (this.scrollbarVerticalNeeded) {
                var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
                if (relOffsetY > 1) {
                    relOffsetY = 1;
                    this.setOffset(undefined, relOffsetY);
                }
                if (this.scrollbarVerticalBox)
                    this.scrollbarVerticalBox.setPosition(undefined, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY);
            }
            this.scrollLock = false;
        };
        Scrollable.prototype.onScrollbarHorizontalMove = function (movable) {
            if (this.scrollLock)
                return;
            var totalWidth = this.viewWidth - this.scrollbarHorizontalBox.layoutWidth;
            var offsetX = Math.min(1, Math.max(0, movable.positionX / totalWidth));
            this.setOffset(offsetX, undefined);
            movable.setPosition(offsetX * totalWidth, undefined);
        };
        Scrollable.prototype.onScrollbarVerticalMove = function (movable) {
            if (this.scrollLock)
                return;
            var totalHeight = this.viewHeight - this.scrollbarVerticalBox.layoutHeight;
            var offsetY = Math.min(1, Math.max(0, movable.positionY / totalHeight));
            this.setOffset(undefined, offsetY);
            movable.setPosition(undefined, offsetY * totalHeight);
        };
        Scrollable.prototype.onScrollIntoView = function (el) {
            var matrix = Ui.Matrix.createTranslate(this.offsetX, this.offsetY).multiply(el.transformToElement(this));
            var p0 = (new Ui.Point(0, 0)).multiply(matrix);
            var p1 = (new Ui.Point(el.layoutWidth, el.layoutHeight)).multiply(matrix);
            if ((p0.y < this.offsetY) || (p0.y > this.offsetY + this.viewHeight) ||
                (p1.y > this.offsetY + this.viewHeight)) {
                if (Math.abs(this.offsetY + this.viewHeight - p1.y) < Math.abs(this.offsetY - p0.y))
                    this.setOffset(this.offsetX, p1.y - this.viewHeight, true);
                else
                    this.setOffset(this.offsetX, p0.y, true);
                this.contentBox.stopInertia();
            }
            if ((p0.x < this.offsetX) || (p0.x > this.offsetX + this.viewWidth) ||
                (p1.x > this.offsetX + this.viewWidth)) {
                if (Math.abs(this.offsetX + this.viewWidth - p1.x) < Math.abs(this.offsetX - p0.x))
                    this.setOffset(p1.x - this.viewWidth, this.offsetY, true);
                else
                    this.setOffset(p0.x, this.offsetY, true);
                this.contentBox.stopInertia();
            }
            _super.prototype.onScrollIntoView.call(this, el);
        };
        Scrollable.prototype.measureCore = function (width, height) {
            var size = { width: 0, height: 0 };
            if (this.scrollbarHorizontalBox)
                this.scrollbarHorizontalBox.measure(width, height);
            if (this.scrollbarVerticalBox)
                this.scrollbarVerticalBox.measure(width, height);
            var contentSize = this.contentBox.measure(width, height);
            if (contentSize.width < width)
                size.width = contentSize.width;
            else
                size.width = width;
            if (contentSize.height < height)
                size.height = contentSize.height;
            else
                size.height = height;
            if (!this.scrollVertical)
                size.height = contentSize.height;
            if (!this.scrollHorizontal)
                size.width = contentSize.width;
            return size;
        };
        Scrollable.prototype.arrangeCore = function (width, height) {
            this.viewWidth = width;
            this.viewHeight = height;
            this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);
            this.contentWidth = this.contentBox.contentWidth;
            this.contentHeight = this.contentBox.contentHeight;
            this.updateOffset();
        };
        return Scrollable;
    }(Ui.Container));
    Ui.Scrollable = Scrollable;
    var ScrollableContent = (function (_super) {
        __extends(ScrollableContent, _super);
        function ScrollableContent() {
            var _this = _super.call(this) || this;
            _this._contentWidth = 0;
            _this._contentHeight = 0;
            _this.addEvents('scroll');
            _this.clipToBounds = true;
            _this.connect(_this.drawing, 'scroll', function () {
                _this.translateX -= _this.drawing.scrollLeft;
                _this.translateY -= _this.drawing.scrollTop;
                _this.drawing.scrollLeft = 0;
                _this.drawing.scrollTop = 0;
                _this.onContentTransform();
            });
            _this.allowTranslate = true;
            _this.allowRotate = false;
            _this.minScale = 1;
            _this.maxScale = 1;
            _this.setTransformOrigin(0, 0);
            _this.inertia = true;
            return _this;
        }
        Object.defineProperty(ScrollableContent.prototype, "offsetX", {
            get: function () {
                return -this.translateX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollableContent.prototype, "offsetY", {
            get: function () {
                return -this.translateY;
            },
            enumerable: true,
            configurable: true
        });
        ScrollableContent.prototype.setOffset = function (x, y) {
            this.setContentTransform(-x, -y, undefined, undefined);
        };
        Object.defineProperty(ScrollableContent.prototype, "contentWidth", {
            get: function () {
                return this._contentWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollableContent.prototype, "contentHeight", {
            get: function () {
                return this._contentHeight;
            },
            enumerable: true,
            configurable: true
        });
        ScrollableContent.prototype.arrangeCore = function (width, height) {
            _super.prototype.arrangeCore.call(this, Math.max(width, this.measureWidth), Math.max(height, this.measureHeight));
            this.onContentTransform();
        };
        ScrollableContent.prototype.onContentTransform = function (testOnly) {
            if (testOnly === void 0) { testOnly = false; }
            var scale = this.scale;
            if (this.translateX > 0)
                this.translateX = 0;
            if (this.translateY > 0)
                this.translateY = 0;
            var viewWidth = this.layoutWidth;
            var viewHeight = this.layoutHeight;
            this._contentWidth = this.firstChild.layoutWidth * scale;
            this._contentHeight = this.firstChild.layoutHeight * scale;
            this.translateX = Math.max(this.translateX, -(this._contentWidth - viewWidth));
            this.translateY = Math.max(this.translateY, -(this._contentHeight - viewHeight));
            _super.prototype.onContentTransform.call(this, testOnly);
            this._contentWidth = this.firstChild.layoutWidth * scale;
            this._contentHeight = this.firstChild.layoutHeight * scale;
            if (testOnly !== true) {
                this.fireEvent('scroll', this);
            }
        };
        return ScrollableContent;
    }(Ui.Transformable));
    Ui.ScrollableContent = ScrollableContent;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Scrollbar = (function (_super) {
        __extends(Scrollbar, _super);
        function Scrollbar(orientation) {
            var _this = _super.call(this) || this;
            _this.orientation = orientation;
            _this.clock = undefined;
            _this.cursor = 'inherit';
            _this.over = new Ui.Overable();
            _this.setContent(_this.over);
            _this.rect = new Ui.Rectangle();
            if (orientation == 'horizontal') {
                _this.rect.width = 30;
                _this.rect.height = 5;
            }
            else {
                _this.rect.width = 5;
                _this.rect.height = 30;
            }
            _this.over.content = _this.rect;
            _this.connect(_this.over, 'enter', _this.startAnim);
            _this.connect(_this.over, 'leave', _this.startAnim);
            _this.connect(_this, 'down', _this.startAnim);
            _this.connect(_this, 'up', _this.startAnim);
            return _this;
        }
        Object.defineProperty(Scrollbar.prototype, "radius", {
            set: function (radius) {
                this.rect.radius = radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scrollbar.prototype, "fill", {
            set: function (color) {
                this.rect.fill = color;
            },
            enumerable: true,
            configurable: true
        });
        Scrollbar.prototype.startAnim = function () {
            if (this.clock == undefined) {
                this.clock = new Anim.Clock();
                this.clock.duration = 'forever';
                this.connect(this.clock, 'timeupdate', this.onTick);
                this.clock.begin();
            }
        };
        Scrollbar.prototype.onTick = function (clock, progress, deltaTick) {
            var d = deltaTick * 30;
            var view = this.over.isOver || this.isDown;
            if (!view)
                d = -d;
            var s = Math.max(5, Math.min(15, ((this.orientation == 'vertical') ? this.rect.width : this.rect.height) + d));
            if (this.orientation == 'vertical')
                this.rect.width = s;
            else
                this.rect.height = s;
            if ((!view && s == 5) || (view && s == 15)) {
                this.clock.stop();
                this.clock = undefined;
            }
        };
        return Scrollbar;
    }(Ui.Movable));
    Ui.Scrollbar = Scrollbar;
    var ScrollingArea = (function (_super) {
        __extends(ScrollingArea, _super);
        function ScrollingArea(init) {
            var _this = _super.call(this) || this;
            _this.horizontalScrollbar = new Scrollbar('horizontal');
            _this.setScrollbarHorizontal(_this.horizontalScrollbar);
            _this.verticalScrollbar = new Scrollbar('vertical');
            _this.setScrollbarVertical(_this.verticalScrollbar);
            if (init)
                _this.assign(init);
            return _this;
        }
        ScrollingArea.prototype.onStyleChange = function () {
            var radius = this.getStyleProperty('radius');
            this.horizontalScrollbar.radius = radius;
            this.verticalScrollbar.radius = radius;
            var color = this.getStyleProperty('color');
            this.horizontalScrollbar.fill = color;
            this.verticalScrollbar.fill = color;
        };
        ScrollingArea.style = {
            color: 'rgba(50,50,50,0.7)',
            radius: 0
        };
        return ScrollingArea;
    }(Ui.Scrollable));
    Ui.ScrollingArea = ScrollingArea;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var CompactLabelContext = (function (_super) {
        __extends(CompactLabelContext, _super);
        function CompactLabelContext() {
            var _this = _super.call(this) || this;
            _this.text = '';
            _this.fontSize = 16;
            _this.fontFamily = 'Sans-Serif';
            _this.fontWeight = 'normal';
            _this.maxLine = Number.MAX_VALUE;
            _this.interLine = 1;
            _this.textAlign = 'left';
            _this.width = Number.MAX_VALUE;
            _this.drawLine = undefined;
            _this.whiteSpace = 'pre-line';
            _this.wordWrap = 'normal';
            _this.textTransform = 'none';
            return _this;
        }
        CompactLabelContext.prototype.setDrawLine = function (func) {
            this.drawLine = func;
        };
        CompactLabelContext.prototype.getWhiteSpace = function () {
            return this.whiteSpace;
        };
        CompactLabelContext.prototype.setWhiteSpace = function (whiteSpace) {
            this.whiteSpace = whiteSpace;
        };
        CompactLabelContext.prototype.getWordWrap = function () {
            return this.wordWrap;
        };
        CompactLabelContext.prototype.setWordWrap = function (wordWrap) {
            this.wordWrap = wordWrap;
        };
        CompactLabelContext.prototype.getMaxLine = function () {
            return this.maxLine;
        };
        CompactLabelContext.prototype.setMaxLine = function (maxLine) {
            if (this.maxLine !== maxLine)
                this.maxLine = maxLine;
        };
        CompactLabelContext.prototype.getTextAlign = function () {
            return this.textAlign;
        };
        CompactLabelContext.prototype.setTextAlign = function (textAlign) {
            if (this.textAlign !== textAlign)
                this.textAlign = textAlign;
        };
        CompactLabelContext.prototype.setInterLine = function (interLine) {
            if (this.interLine !== interLine)
                this.interLine = interLine;
        };
        CompactLabelContext.prototype.getInterLine = function () {
            return this.interLine;
        };
        CompactLabelContext.prototype.getText = function () {
            return this.text;
        };
        CompactLabelContext.prototype.setText = function (text) {
            if (this.text !== text) {
                this.text = text;
            }
        };
        CompactLabelContext.prototype.setFontSize = function (fontSize) {
            if (this.fontSize !== fontSize) {
                this.fontSize = fontSize;
            }
        };
        CompactLabelContext.prototype.getFontSize = function () {
            return this.fontSize;
        };
        CompactLabelContext.prototype.setFontFamily = function (fontFamily) {
            if (this.fontFamily !== fontFamily) {
                this.fontFamily = fontFamily;
            }
        };
        CompactLabelContext.prototype.getFontFamily = function () {
            return this.fontFamily;
        };
        CompactLabelContext.prototype.setFontWeight = function (fontWeight) {
            if (this.fontWeight !== fontWeight) {
                this.fontWeight = fontWeight;
            }
        };
        CompactLabelContext.prototype.getFontWeight = function () {
            return this.fontWeight;
        };
        CompactLabelContext.prototype.getTextTransform = function () {
            return this.textTransform;
        };
        CompactLabelContext.prototype.setTextTransform = function (textTransform) {
            this.textTransform = textTransform;
        };
        CompactLabelContext.prototype.getTransformedText = function () {
            if (this.textTransform === 'lowercase')
                return this.text.toLowerCase();
            else if (this.textTransform === 'uppercase')
                return this.text.toUpperCase();
            else
                return this.text;
        };
        CompactLabelContext.prototype.flushLine = function (y, line, width, render, lastLine) {
            if (lastLine === void 0) { lastLine = false; }
            var size = Ui.Label.measureText(line, this.getFontSize(), this.getFontFamily(), this.getFontWeight());
            if (render) {
                var x = void 0;
                if (this.textAlign == 'left')
                    x = 0;
                else if (this.textAlign == 'right')
                    x = width - size.width;
                else
                    x = (width - size.width) / 2;
                if (render)
                    this.drawLine(x, y, line);
            }
            return size.height * ((lastLine === true) ? 1 : this.getInterLine());
        };
        CompactLabelContext.prototype.updateFlow = function (width, render) {
            if (this.text === undefined)
                return { width: 0, height: 0 };
            var text = this.getTransformedText();
            var fontSize = this.getFontSize();
            var fontFamily = this.getFontFamily();
            var fontWeight = this.getFontWeight();
            var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;
            var y = 0;
            var x = 0;
            var line = '';
            var lineCount = 0;
            var maxWidth = 0;
            for (var i = 0; i < text.length; i++) {
                var size = Ui.Label.measureText(line + text.charAt(i), fontSize, fontFamily, fontWeight);
                if ((this.maxLine !== undefined) && (lineCount + 1 >= this.maxLine) && (size.width + dotWidth > width)) {
                    y += this.flushLine(y, line + '...', width, render);
                    if (x + dotWidth > maxWidth)
                        maxWidth = x + dotWidth;
                    return { width: maxWidth, height: y };
                }
                else if (size.width > width) {
                    y += this.flushLine(y, line, width, render);
                    lineCount++;
                    if (x > maxWidth)
                        maxWidth = x;
                    line = text.charAt(i);
                }
                else
                    line += text.charAt(i);
                x = size.width;
            }
            if (line !== '') {
                y += this.flushLine(y, line, width, render, true);
                if (x > maxWidth)
                    maxWidth = x;
            }
            return { width: maxWidth, height: y };
        };
        CompactLabelContext.prototype.updateFlowWords = function (width, render) {
            if (this.text == undefined)
                return { width: 0, height: 0 };
            var i;
            var lineWidth;
            var text = this.getTransformedText();
            var fontSize = this.getFontSize();
            var fontFamily = this.getFontFamily();
            var fontWeight = this.getFontWeight();
            var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;
            var words = [];
            var wordsSize = [];
            var tmpWords = text.split(' ');
            for (i = 0; i < tmpWords.length; i++) {
                var word = tmpWords[i];
                while (true) {
                    var wordSize = (Ui.Label.measureText(word, fontSize, fontFamily, fontWeight)).width;
                    if (wordSize < width) {
                        words.push(word);
                        wordsSize.push(wordSize);
                        break;
                    }
                    else {
                        var tmpWord = '';
                        for (var i2 = 0; i2 < word.length; i2++) {
                            if ((Ui.Label.measureText(tmpWord + word.charAt(i2), fontSize, fontFamily, fontWeight)).width < width)
                                tmpWord += word.charAt(i2);
                            else {
                                if (tmpWord === '')
                                    tmpWord = word.charAt(0);
                                words.push(tmpWord);
                                wordsSize.push((Ui.Label.measureText(tmpWord, fontSize, fontFamily, fontWeight)).width);
                                word = word.substr(tmpWord.length, word.length - tmpWord.length);
                                break;
                            }
                        }
                    }
                    if (word.length === 0)
                        break;
                }
            }
            var spaceWidth = (Ui.Label.measureText('. .', fontSize, fontFamily, fontWeight)).width - (Ui.Label.measureText('..', fontSize, fontFamily, fontWeight)).width;
            var y = 0;
            var x = 0;
            var maxWidth = 0;
            var line = '';
            var lineCount = 0;
            for (i = 0; i < words.length; i++) {
                if (line !== '') {
                    if (x + spaceWidth > width) {
                        if (lineCount + 1 >= this.maxLine) {
                            while (true) {
                                lineWidth = (Ui.Label.measureText(line, fontSize, fontFamily, fontWeight)).width;
                                if (lineWidth + dotWidth > width) {
                                    if (line.length <= 1) {
                                        line = '...';
                                        break;
                                    }
                                    line = line.substr(0, line.length - 1);
                                }
                                else {
                                    line += '...';
                                    break;
                                }
                            }
                            y += this.flushLine(y, line, width, render);
                            if (x > maxWidth)
                                maxWidth = x;
                            return { width: maxWidth, height: y };
                        }
                        y += this.flushLine(y, line, width, render);
                        if (x > maxWidth)
                            maxWidth = x;
                        x = 0;
                        lineCount++;
                        line = '';
                    }
                    else {
                        line += ' ';
                        x += spaceWidth;
                    }
                }
                if (x + wordsSize[i] > width) {
                    if (lineCount + 1 >= this.maxLine) {
                        while (true) {
                            lineWidth = (Ui.Label.measureText(line, fontSize, fontFamily, fontWeight)).width;
                            if (lineWidth + dotWidth > width) {
                                if (line.length <= 1) {
                                    line = '...';
                                    break;
                                }
                                line = line.substr(0, line.length - 1);
                            }
                            else {
                                line += '...';
                                break;
                            }
                        }
                        y += this.flushLine(y, line, width, render);
                        if (x > maxWidth)
                            maxWidth = x;
                        return { width: maxWidth, height: y };
                    }
                    y += this.flushLine(y, line, width, render);
                    lineCount++;
                    if (x > maxWidth)
                        maxWidth = x;
                    x = wordsSize[i];
                    line = words[i];
                }
                else {
                    line += words[i];
                    x += wordsSize[i];
                }
            }
            if (line !== '') {
                y += this.flushLine(y, line, width, render, true);
                if (x > maxWidth)
                    maxWidth = x;
            }
            return { width: maxWidth, height: y };
        };
        CompactLabelContext.prototype.drawText = function (width, render) {
            if (this.whiteSpace === 'nowrap') {
                var text = this.getTransformedText();
                var size = Ui.Label.measureText(text, this.fontSize, this.fontFamily, this.fontWeight);
                if (render)
                    this.flushLine(0, text, width, true, true);
                return size;
            }
            else if (this.wordWrap === 'normal')
                return this.updateFlowWords(width, render);
            else
                return this.updateFlow(width, render);
        };
        return CompactLabelContext;
    }(Core.Object));
    Ui.CompactLabelContext = CompactLabelContext;
    var CompactLabel = (function (_super) {
        __extends(CompactLabel, _super);
        function CompactLabel(init) {
            var _this = _super.call(this) || this;
            _this._fontSize = undefined;
            _this._fontFamily = undefined;
            _this._fontWeight = undefined;
            _this._color = undefined;
            _this._maxLine = undefined;
            _this._interLine = undefined;
            _this._textAlign = undefined;
            _this.isMeasureValid = false;
            _this.isArrangeValid = false;
            _this.lastMeasureWidth = 0;
            _this.lastMeasureHeight = 0;
            _this.lastAvailableWidth = 0;
            _this.textContext = undefined;
            _this._whiteSpace = undefined;
            _this._wordWrap = undefined;
            _this._textTransform = undefined;
            _this.selectable = false;
            _this.textContext = new Ui.CompactLabelContext();
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(CompactLabel.prototype, "maxLine", {
            get: function () {
                if (this._maxLine !== undefined)
                    return this._maxLine;
                else
                    return this.getStyleProperty('maxLine');
            },
            set: function (maxLine) {
                this._maxLine = maxLine;
                this.textContext.setMaxLine(this.maxLine);
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "text", {
            get: function () {
                return this.textContext.getText();
            },
            set: function (text) {
                this.textContext.setText(text);
                this.isMeasureValid = false;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "textAlign", {
            get: function () {
                if (this._textAlign !== undefined)
                    return this._textAlign;
                else
                    return this.getStyleProperty('textAlign');
            },
            set: function (textAlign) {
                this._textAlign = textAlign;
                this.textContext.setTextAlign(this.textAlign);
                this.invalidateArrange();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "interLine", {
            get: function () {
                if (this._interLine !== undefined)
                    return this._interLine;
                else
                    return this.getStyleProperty('interLine');
            },
            set: function (interLine) {
                this._interLine = interLine;
                this.textContext.setInterLine(this.interLine);
                this.isMeasureValid = false;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "fontSize", {
            get: function () {
                if (this._fontSize !== undefined)
                    return this._fontSize;
                else
                    return this.getStyleProperty('fontSize');
            },
            set: function (fontSize) {
                this._fontSize = fontSize;
                this.isMeasureValid = false;
                this.textContext.setFontSize(this.fontSize);
                this.textDrawing.style.fontSize = this.fontSize + 'px';
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "fontFamily", {
            get: function () {
                if (this._fontFamily !== undefined)
                    return this._fontFamily;
                else
                    return this.getStyleProperty('fontFamily');
            },
            set: function (fontFamily) {
                this._fontFamily = fontFamily;
                this.isMeasureValid = false;
                this.textContext.setFontFamily(this.fontFamily);
                this.textDrawing.style.fontFamily = this.fontFamily;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "fontWeight", {
            get: function () {
                if (this._fontWeight !== undefined)
                    return this._fontWeight;
                else
                    return this.getStyleProperty('fontWeight');
            },
            set: function (fontWeight) {
                this._fontWeight = fontWeight;
                this.isMeasureValid = false;
                this.textContext.setFontWeight(fontWeight);
                this.textDrawing.style.fontWeight = this.fontWeight;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "whiteSpace", {
            get: function () {
                if (this._whiteSpace !== undefined)
                    return this._whiteSpace;
                else
                    return this.getStyleProperty('whiteSpace');
            },
            set: function (whiteSpace) {
                if (this._whiteSpace !== whiteSpace) {
                    this.isMeasureValid = false;
                    this._whiteSpace = whiteSpace;
                    this.textContext.setWhiteSpace(this.whiteSpace);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "wordWrap", {
            get: function () {
                if (this._wordWrap !== undefined)
                    return this._wordWrap;
                else
                    return this.getStyleProperty('wordWrap');
            },
            set: function (wordWrap) {
                if (this._wordWrap !== wordWrap) {
                    this.isMeasureValid = false;
                    this._wordWrap = wordWrap;
                    this.textContext.setWordWrap(this.wordWrap);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "textTransform", {
            get: function () {
                if (this._textTransform !== undefined)
                    return this._textTransform;
                else
                    return this.getStyleProperty('textTransform');
            },
            set: function (textTransform) {
                if (this._textTransform !== textTransform) {
                    this.isMeasureValid = false;
                    this._textTransform = textTransform;
                    this.textContext.setTextTransform(this.textTransform);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CompactLabel.prototype, "color", {
            get: function () {
                if (this._color !== undefined)
                    return this._color;
                else
                    return Ui.Color.create(this.getStyleProperty('color'));
            },
            set: function (color) {
                if (this._color !== color) {
                    this._color = color;
                    if (Core.Navigator.supportRgba)
                        this.textDrawing.style.color = this._color.getCssRgba();
                    else
                        this.textDrawing.style.color = this._color.getCssHtml();
                }
            },
            enumerable: true,
            configurable: true
        });
        CompactLabel.prototype.renderDrawing = function () {
            var drawing = _super.prototype.renderDrawing.call(this);
            this.textDrawing = document.createElement('div');
            this.textDrawing.style.fontFamily = this.fontFamily;
            this.textDrawing.style.fontWeight = this.fontWeight;
            this.textDrawing.style.fontSize = this.fontSize + 'px';
            if (Core.Navigator.supportRgba)
                this.textDrawing.style.color = this.color.getCssRgba();
            else
                this.textDrawing.style.color = this.color.getCssHtml();
            this.textDrawing.style.position = 'absolute';
            this.textDrawing.style.left = '0px';
            this.textDrawing.style.top = '0px';
            drawing.appendChild(this.textDrawing);
            return drawing;
        };
        CompactLabel.prototype.onStyleChange = function () {
            this.textDrawing.style.fontSize = this.fontSize + 'px';
            this.textDrawing.style.fontFamily = this.fontFamily;
            this.textDrawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                this.textDrawing.style.color = this.color.getCssRgba();
            else
                this.textDrawing.style.color = this.color.getCssHtml();
            this.textContext.setMaxLine(this.maxLine);
            this.textContext.setTextAlign(this.textAlign);
            this.textContext.setFontSize(this.fontSize);
            this.textContext.setFontFamily(this.fontFamily);
            this.textContext.setFontWeight(this.fontWeight);
            this.textContext.setInterLine(this.interLine);
            this.textContext.setWhiteSpace(this.whiteSpace);
            this.textContext.setWordWrap(this.wordWrap);
            this.textContext.setTextTransform(this.textTransform);
            this.invalidateMeasure();
        };
        CompactLabel.prototype.measureCore = function (width, height) {
            if (!this.isMeasureValid || (this.lastAvailableWidth !== width)) {
                this.lastAvailableWidth = width;
                var size = this.textContext.drawText(width, false);
                this.lastMeasureHeight = size.height;
                this.lastMeasureWidth = size.width;
                this.isMeasureValid = true;
                this.isArrangeValid = false;
            }
            return { width: this.lastMeasureWidth, height: this.lastMeasureHeight };
        };
        CompactLabel.prototype.arrangeCore = function (width, height) {
            while (this.textDrawing.hasChildNodes())
                this.textDrawing.removeChild(this.textDrawing.firstChild);
            var textDrawing = this.textDrawing;
            this.textContext.setDrawLine(function (x, y, line) {
                var tspan = document.createElement('div');
                tspan.style.whiteSpace = 'nowrap';
                tspan.style.display = 'inline';
                tspan.style.position = 'absolute';
                tspan.style.left = x + 'px';
                tspan.style.top = y + 'px';
                if ('textContent' in tspan)
                    tspan.textContent = line;
                else
                    tspan.innerText = line;
                textDrawing.appendChild(tspan);
            });
            this.textContext.drawText(width, true);
        };
        CompactLabel.style = {
            maxLine: Number.MAX_VALUE,
            color: new Ui.Color(0, 0, 0),
            fontSize: 16,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            interLine: 1,
            textAlign: 'left',
            whiteSpace: 'pre-line',
            wordWrap: 'normal',
            textTransform: 'none'
        };
        return CompactLabel;
    }(Ui.Element));
    Ui.CompactLabel = CompactLabel;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DropBox = (function (_super) {
        __extends(DropBox, _super);
        function DropBox(init) {
            var _this = _super.call(this, init) || this;
            _this.watchers = undefined;
            _this.allowedTypes = undefined;
            _this.addEvents('drageffect', 'dragenter', 'dragleave', 'drop', 'dropfile');
            _this.watchers = [];
            _this.connect(_this, 'dragover', _this.onDragOver);
            return _this;
        }
        DropBox.prototype.addType = function (type, effects) {
            if (typeof (type) === 'string')
                type = type.toLowerCase();
            if (this.allowedTypes == undefined)
                this.allowedTypes = [];
            if (typeof (effects) === 'string')
                effects = [effects];
            if (typeof (effects) !== 'function') {
                for (var i = 0; i < effects.length; i++) {
                    var effect = effects[i];
                    if (typeof (effect) === 'string')
                        effect = { action: effect };
                    if (!('text' in effect)) {
                        if (effect.action === 'copy')
                            effect.text = 'Copier';
                        else if (effect.action === 'move')
                            effect.text = 'Déplacer';
                        else if (effect.action === 'link')
                            effect.text = 'Lier';
                        else
                            effect.text = effect.action;
                    }
                    if (!('dragicon' in effect))
                        effect.dragicon = 'drag' + effect.action;
                    effects[i] = effect;
                }
                this.allowedTypes.push({ type: type, effect: effects });
            }
            else
                this.allowedTypes.push({ type: type, effect: effects });
        };
        DropBox.prototype.onDragOver = function (event) {
            var found = false;
            for (var i = 0; !found && (i < this.watchers.length); i++)
                found = (this.watchers[i].getDataTransfer() === event.dataTransfer);
            if (!found) {
                var effect = this.onDragEffect(event.dataTransfer);
                if ((effect !== undefined) && (effect.length > 0)) {
                    var watcher = event.dataTransfer.capture(this, effect);
                    this.watchers.push(watcher);
                    this.connect(watcher, 'move', this.onWatcherMove);
                    this.connect(watcher, 'drop', this.onWatcherDrop);
                    this.connect(watcher, 'leave', this.onWatcherLeave);
                    event.stopImmediatePropagation();
                    this.onWatcherEnter(watcher);
                }
            }
            else
                event.stopImmediatePropagation();
        };
        DropBox.prototype.onWatcherEnter = function (watcher) {
            this.onDragEnter(watcher.getDataTransfer());
        };
        DropBox.prototype.onWatcherMove = function (watcher) {
        };
        DropBox.prototype.onWatcherDrop = function (watcher, effect, x, y) {
            var point = this.pointFromWindow(new Ui.Point(x, y));
            this.onDrop(watcher.getDataTransfer(), effect, point.getX(), point.getY());
        };
        DropBox.prototype.onWatcherLeave = function (watcher) {
            var found = false;
            var i = 0;
            for (; !found && (i < this.watchers.length); i++) {
                found = (this.watchers[i] === watcher);
            }
            i--;
            if (found)
                this.watchers.splice(i, 1);
            if (this.watchers.length === 0)
                this.onDragLeave();
        };
        DropBox.prototype.getAllowedTypesEffect = function (dataTransfer) {
            if (this.allowedTypes !== undefined) {
                var data = dataTransfer.getData();
                var effect = undefined;
                for (var i = 0; (effect === undefined) && (i < this.allowedTypes.length); i++) {
                    var type = this.allowedTypes[i];
                    if (typeof (type.type) === 'string') {
                        if (type.type === 'all')
                            effect = type.effect;
                        else if (data instanceof Ui.DragNativeData) {
                            if ((type.type === 'files') && data.hasFiles())
                                effect = type.effect;
                            else if (((type.type === 'text') || (type.type === 'text/plain')) && data.hasTypes('text/plain', 'text'))
                                effect = type.effect;
                            else if (data.hasType(type.type))
                                effect = type.effect;
                        }
                    }
                    else if (data instanceof type.type)
                        effect = type.effect;
                }
                if (typeof (effect) === 'function') {
                    var effects = this.onDragEffectFunction(dataTransfer, effect);
                    for (var i = 0; i < effects.length; i++) {
                        var effect_1 = effects[i];
                        if (typeof (effect_1) === 'string')
                            effect_1 = { action: effect_1 };
                        if (!('text' in effect_1)) {
                            if (effect_1.action === 'copy')
                                effect_1.text = 'Copier';
                            else if (effect_1.action === 'move')
                                effect_1.text = 'Déplacer';
                            else if (effect_1.action === 'link')
                                effect_1.text = 'Lier';
                            else if (effect_1.action === 'run')
                                effect_1.text = 'Exécuter';
                            else if (effect_1.action === 'play')
                                effect_1.text = 'Jouer';
                            else
                                effect_1.text = effect_1.action;
                        }
                        if (!('dragicon' in effect_1))
                            effect_1.dragicon = 'drag' + effect_1.action;
                        effects[i] = effect_1;
                    }
                    effect = effects;
                }
                if (effect === undefined)
                    effect = [];
                return effect;
            }
            else
                return [];
        };
        DropBox.prototype.onDragEffect = function (dataTransfer) {
            var dragEvent = new Ui.DragEvent();
            dragEvent.setType('drageffect');
            dragEvent.setBubbles(false);
            dragEvent.dataTransfer = dataTransfer;
            dragEvent.dispatchEvent(this);
            var effectAllowed = dragEvent.effectAllowed;
            if (effectAllowed !== undefined)
                return dragEvent.effectAllowed;
            else
                return this.getAllowedTypesEffect(dataTransfer);
        };
        DropBox.prototype.onDragEffectFunction = function (dataTransfer, func) {
            return func(dataTransfer.getData(), dataTransfer);
        };
        DropBox.prototype.onDrop = function (dataTransfer, dropEffect, x, y) {
            var done = false;
            if (!this.fireEvent('drop', this, dataTransfer.getData(), dropEffect, x, y, dataTransfer)) {
                var data = dataTransfer.getData();
                if (data instanceof Ui.DragNativeData && data.hasFiles()) {
                    var files = data.getFiles();
                    done = true;
                    for (var i = 0; i < files.length; i++)
                        done = done && this.fireEvent('dropfile', this, files[i], dropEffect, x, y);
                }
            }
            else
                done = true;
            return done;
        };
        DropBox.prototype.onDragEnter = function (dataTransfer) {
            this.fireEvent('dragenter', this, dataTransfer.getData());
        };
        DropBox.prototype.onDragLeave = function () {
            this.fireEvent('dragleave', this);
        };
        return DropBox;
    }(Ui.LBox));
    Ui.DropBox = DropBox;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ButtonText = (function (_super) {
        __extends(ButtonText, _super);
        function ButtonText() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ButtonText;
    }(Ui.CompactLabel));
    Ui.ButtonText = ButtonText;
    var ButtonBackground = (function (_super) {
        __extends(ButtonBackground, _super);
        function ButtonBackground() {
            var _this = _super.call(this) || this;
            _this._borderWidth = 1;
            _this._border = undefined;
            _this._background = undefined;
            _this._radius = 3;
            _this.border = 'black';
            _this.background = 'white';
            return _this;
        }
        Object.defineProperty(ButtonBackground.prototype, "borderWidth", {
            set: function (borderWidth) {
                this._borderWidth = borderWidth;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonBackground.prototype, "border", {
            set: function (border) {
                this._border = Ui.Color.create(border);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonBackground.prototype, "radius", {
            set: function (radius) {
                this._radius = radius;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonBackground.prototype, "background", {
            set: function (background) {
                this._background = Ui.Color.create(background);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        ButtonBackground.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var radius = Math.min(this._radius, Math.min(w, h) / 2);
            ctx.beginPath();
            var br = Math.max(0, radius - this._borderWidth);
            ctx.roundRect(this._borderWidth, this._borderWidth, w - this._borderWidth * 2, h - this._borderWidth * 2, br, br, br, br);
            ctx.closePath();
            ctx.fillStyle = this._background.getCssRgba();
            ctx.fill();
            if (this._borderWidth > 0) {
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, radius, radius, radius, radius);
                ctx.roundRect(this._borderWidth, this._borderWidth, w - this._borderWidth * 2, h - this._borderWidth * 2, br, br, br, br, true);
                ctx.closePath();
                ctx.fillStyle = this._border.getCssRgba();
                ctx.fill();
            }
        };
        return ButtonBackground;
    }(Ui.CanvasElement));
    Ui.ButtonBackground = ButtonBackground;
    var ButtonIcon = (function (_super) {
        __extends(ButtonIcon, _super);
        function ButtonIcon() {
            var _this = _super.call(this) || this;
            _this._badge = undefined;
            _this._badgeColor = undefined;
            _this._badgeTextColor = undefined;
            _this._fill = undefined;
            _this._icon = 'eye';
            _this.fill = 'black';
            _this.badgeColor = 'red';
            _this.badgeTextColor = 'white';
            return _this;
        }
        Object.defineProperty(ButtonIcon.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (icon) {
                this._icon = icon;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonIcon.prototype, "badge", {
            set: function (badge) {
                this._badge = badge;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonIcon.prototype, "badgeColor", {
            set: function (badgeColor) {
                this._badgeColor = Ui.Color.create(badgeColor);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonIcon.prototype, "badgeTextColor", {
            set: function (badgeTextColor) {
                this._badgeTextColor = Ui.Color.create(badgeTextColor);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonIcon.prototype, "fill", {
            set: function (fill) {
                this._fill = Ui.Color.create(fill);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        ButtonIcon.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var iconSize = Math.min(w, h);
            ctx.save();
            ctx.translate((w - iconSize) / 2, (h - iconSize) / 2);
            if (this._badge !== undefined)
                Ui.Icon.drawIconAndBadge(ctx, this._icon, iconSize, this._fill.getCssRgba(), this._badge, iconSize / 2.5, this._badgeColor.getCssRgba(), this._badgeTextColor.getCssRgba());
            else
                Ui.Icon.drawIcon(ctx, this._icon, iconSize, this._fill.getCssRgba());
            ctx.restore();
        };
        return ButtonIcon;
    }(Ui.CanvasElement));
    Ui.ButtonIcon = ButtonIcon;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(init) {
            var _this = _super.call(this) || this;
            _this._isActive = false;
            _this._icon = undefined;
            _this._text = undefined;
            _this._marker = undefined;
            _this._badge = undefined;
            _this._orientation = undefined;
            _this.dropbox = new Ui.DropBox();
            _this.setContent(_this.dropbox);
            _this.bg = new ButtonBackground();
            _this.dropbox.content = _this.bg;
            _this.mainBox = new Ui.HBox();
            _this.mainBox.verticalAlign = 'center';
            _this.dropbox.append(_this.mainBox);
            _this.buttonPartsBox = new Ui.Box();
            _this.mainBox.append(_this.buttonPartsBox, true);
            _this._textBox = new Ui.LBox();
            _this._iconBox = new Ui.LBox();
            _this.connect(_this, 'down', _this.updateColors);
            _this.connect(_this, 'up', _this.updateColors);
            _this.connect(_this, 'focus', _this.updateColors);
            _this.connect(_this, 'blur', _this.updateColors);
            _this.connect(_this, 'enter', _this.updateColors);
            _this.connect(_this, 'leave', _this.updateColors);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Button.prototype, "dropBox", {
            get: function () {
                return this.dropbox;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "background", {
            get: function () {
                return this.bg;
            },
            set: function (bg) {
                this.dropbox.remove(this.bg);
                if (bg === undefined)
                    this.bg = new ButtonBackground();
                else
                    this.bg = bg;
                this.dropbox.prepend(this.bg);
                this.onStyleChange();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "textBox", {
            get: function () {
                return this._textBox;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "text", {
            get: function () {
                return (this._text instanceof ButtonText) ? this._text.text : undefined;
            },
            set: function (text) {
                this.setTextOrElement(text);
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.setTextOrElement = function (text) {
            if (typeof (text) === 'string') {
                if (this._text !== undefined) {
                    if (this._text instanceof ButtonText)
                        this._text.text = text;
                    else {
                        this._text = new ButtonText();
                        this._text.text = text;
                        this._text.color = this.getForegroundColor();
                        this._textBox.content = this._text;
                    }
                }
                else {
                    this._text = new ButtonText();
                    this._text.text = text;
                    this._text.color = this.getForegroundColor();
                    this._textBox.content = this._text;
                }
            }
            else {
                this._text = text;
                if (this._text instanceof Ui.Element)
                    this._textBox.content = this._text;
                else if (this._text !== undefined) {
                    this._text = new ButtonText();
                    this._text.text = this._text.toString();
                    this._text.color = this.getForegroundColor();
                    this._textBox.content = this._text;
                }
            }
            this.updateVisibles();
        };
        Object.defineProperty(Button.prototype, "iconBox", {
            get: function () {
                return this._iconBox;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "icon", {
            get: function () {
                return (this._icon instanceof ButtonIcon) ? this._icon.icon : undefined;
            },
            set: function (icon) {
                this.setIconOrElement(icon);
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.setIconOrElement = function (icon) {
            if (typeof (icon) === 'string') {
                if (this._icon != undefined) {
                    if (this._icon instanceof ButtonIcon)
                        this._icon.icon = icon;
                    else {
                        this._icon = new ButtonIcon();
                        this._icon.icon = icon;
                        this._icon.badge = this._badge;
                        this._icon.fill = this.getForegroundColor();
                        this._icon.badgeColor = this.getStyleProperty('badgeColor');
                        this._icon.badgeTextColor = this.getStyleProperty('badgeTextColor');
                        this._iconBox.content = this._icon;
                    }
                }
                else {
                    this._icon = new ButtonIcon();
                    this._icon.icon = icon;
                    this._icon.badge = this._badge;
                    this._icon.fill = this.getForegroundColor();
                    this._icon.badgeColor = this.getStyleProperty('badgeColor');
                    this._icon.badgeTextColor = this.getStyleProperty('badgeTextColor');
                    this._iconBox.content = this._icon;
                }
            }
            else {
                this._icon = icon;
                this._iconBox.content = this._icon;
            }
            this.updateVisibles();
        };
        Object.defineProperty(Button.prototype, "marker", {
            get: function () {
                return this._marker;
            },
            set: function (marker) {
                if (this._marker !== undefined)
                    this.mainBox.remove(this._marker);
                this._marker = marker;
                this.mainBox.append(this._marker);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "isActive", {
            get: function () {
                return this._isActive;
            },
            set: function (isActive) {
                if (this._isActive !== isActive) {
                    this._isActive = isActive;
                    this.updateColors();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "badge", {
            get: function () {
                return this._badge;
            },
            set: function (text) {
                this._badge = text;
                if (this._icon instanceof ButtonIcon) {
                    this._icon.badge = text;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "orientation", {
            get: function () {
                if (this._orientation !== undefined)
                    return this._orientation;
                else
                    return this.getStyleProperty('orientation');
            },
            set: function (orientation) {
                this._orientation = orientation;
                this.buttonPartsBox.orientation = this.orientation;
                this.updateVisibles();
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.getBackgroundColor = function () {
            var color;
            if (this._isActive) {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusActiveBackground'));
                else
                    color = Ui.Color.create(this.getStyleProperty('activeBackground'));
            }
            else {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusBackground'));
                else
                    color = Ui.Color.create(this.getStyleProperty('background'));
            }
            var yuv = color.getYuva();
            var deltaY = 0;
            if (this.isDown)
                deltaY = -0.20;
            else if (this.isOver) {
                deltaY = 0.20;
                yuv.a = Math.max(0.4, yuv.a);
            }
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v, yuv.a);
        };
        Button.prototype.getBackgroundBorderColor = function () {
            var color;
            if (this._isActive) {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusActiveBackgroundBorder'));
                else
                    color = Ui.Color.create(this.getStyleProperty('activeBackgroundBorder'));
            }
            else {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusBackgroundBorder'));
                else
                    color = Ui.Color.create(this.getStyleProperty('backgroundBorder'));
            }
            var yuv = color.getYuva();
            var deltaY = 0;
            if (this.isDown)
                deltaY = -0.20;
            else if (this.isOver)
                deltaY = 0.20;
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v, yuv.a);
        };
        Button.prototype.getForegroundColor = function () {
            var color;
            if (this._isActive) {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusActiveForeground'));
                else
                    color = Ui.Color.create(this.getStyleProperty('activeForeground'));
            }
            else {
                if (this.hasFocus && !this.getIsMouseFocus())
                    color = Ui.Color.create(this.getStyleProperty('focusForeground'));
                else
                    color = Ui.Color.create(this.getStyleProperty('foreground'));
            }
            var deltaY = 0;
            if (this.isDown)
                deltaY = -0.20;
            else if (this.isOver)
                deltaY = 0.20;
            var yuv = color.getYuva();
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v, yuv.a);
        };
        Object.defineProperty(Button.prototype, "isTextVisible", {
            get: function () {
                return ((this._text !== undefined) && (this.getStyleProperty('showText') || (this._icon === undefined)));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "isIconVisible", {
            get: function () {
                return ((this._icon !== undefined) && (this.getStyleProperty('showIcon') || (this._text === undefined)));
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.updateVisibles = function () {
            if (this.isTextVisible) {
                if (this._textBox.parent == undefined)
                    this.buttonPartsBox.append(this._textBox, true);
                if (this._text instanceof ButtonText) {
                    if (this.isIconVisible && (this.orientation === 'horizontal')) {
                        this._text.textAlign = 'left';
                        this.mainBox.horizontalAlign = undefined;
                    }
                    else {
                        this._text.textAlign = 'center';
                        this.mainBox.horizontalAlign = 'center';
                    }
                    this._text.fontFamily = this.getStyleProperty('fontFamily');
                    this._text.fontSize = this.getStyleProperty('fontSize');
                    this._text.fontWeight = this.getStyleProperty('fontWeight');
                    this._text.maxLine = this.getStyleProperty('maxLine');
                    this._text.whiteSpace = this.getStyleProperty('whiteSpace');
                    this._text.interLine = this.getStyleProperty('interLine');
                    this._text.textTransform = this.getStyleProperty('textTransform');
                }
            }
            else if (this._textBox.parent != undefined)
                this.buttonPartsBox.remove(this._textBox);
            if (this.isIconVisible) {
                Ui.Box.setResizable(this._iconBox, !this.isTextVisible);
                if (this._iconBox.parent == undefined)
                    this.buttonPartsBox.prepend(this._iconBox);
            }
            else if (this._iconBox.parent != undefined)
                this.buttonPartsBox.remove(this._iconBox);
            if (this.orientation === 'horizontal') {
                if (this.isTextVisible)
                    this._text.verticalAlign = 'center';
            }
            else {
                if (this.isIconVisible && this.isTextVisible)
                    this._text.verticalAlign = 'top';
                else if (this.isTextVisible)
                    this._text.verticalAlign = 'center';
            }
        };
        Button.prototype.updateColors = function () {
            var fg = this.getForegroundColor();
            if (this.bg instanceof ButtonBackground) {
                this.bg.background = this.getBackgroundColor();
                this.bg.border = this.getBackgroundBorderColor();
            }
            if (this._text instanceof ButtonText)
                this._text.color = fg;
            if (this._icon instanceof ButtonIcon) {
                this._icon.fill = fg;
                this._icon.badgeColor = this.getStyleProperty('badgeColor');
                this._icon.badgeTextColor = this.getStyleProperty('badgeTextColor');
            }
        };
        Button.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.opacity = 0.4;
        };
        Button.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.opacity = 1;
        };
        Button.prototype.onStyleChange = function () {
            console.log(this.getClassName() + '.onStyleChange');
            this.buttonPartsBox.spacing = Math.max(0, this.getStyleProperty('spacing'));
            this.buttonPartsBox.margin = Math.max(0, this.getStyleProperty('padding'));
            if (this.bg instanceof ButtonBackground) {
                this.bg.radius = this.getStyleProperty('radius');
                this.bg.borderWidth = this.getStyleProperty('borderWidth');
            }
            var iconSize = Math.max(0, this.getStyleProperty('iconSize'));
            this._iconBox.width = iconSize;
            this._iconBox.height = iconSize;
            this._textBox.width = this.getStyleProperty('textWidth');
            this._textBox.maxWidth = this.getStyleProperty('maxTextWidth');
            this._textBox.height = this.getStyleProperty('textHeight');
            this.buttonPartsBox.orientation = this.orientation;
            this.updateVisibles();
            this.updateColors();
        };
        Button.style = {
            orientation: 'horizontal',
            borderWidth: 1,
            badgeColor: 'red',
            badgeTextColor: 'white',
            background: 'rgba(250,250,250,1)',
            backgroundBorder: 'rgba(140,140,140,1)',
            foreground: '#444444',
            activeBackground: 'rgba(250,250,250,1)',
            activeBackgroundBorder: 'rgba(140,140,140,1)',
            activeForeground: '#dc6c36',
            focusBackground: '#07a0e5',
            focusBackgroundBorder: new Ui.Color(0.04, 0.43, 0.5),
            focusForeground: 'rgba(250,250,250,1)',
            focusActiveBackground: 'rgb(33,211,255)',
            focusActiveBackgroundBorder: new Ui.Color(0.04, 0.43, 0.5),
            focusActiveForeground: 'white',
            radius: 3,
            spacing: 10,
            padding: 7,
            iconSize: 26,
            fontSize: 16,
            fontFamily: 'Sans-serif',
            fontWeight: 'normal',
            textWidth: 70,
            textTransform: 'uppercase',
            maxTextWidth: Number.MAX_VALUE,
            textHeight: 26,
            interLine: 1,
            maxLine: 3,
            whiteSpace: 'nowrap',
            showText: true,
            showIcon: true
        };
        return Button;
    }(Ui.Selectionable));
    Ui.Button = Button;
    var DefaultButton = (function (_super) {
        __extends(DefaultButton, _super);
        function DefaultButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DefaultButton.style = {
            borderWidth: 1,
            background: '#444444',
            backgroundBorder: '#444444',
            foreground: 'rgba(250,250,250,1)'
        };
        return DefaultButton;
    }(Button));
    Ui.DefaultButton = DefaultButton;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ActionButton = (function (_super) {
        __extends(ActionButton, _super);
        function ActionButton() {
            var _this = _super.call(this) || this;
            _this._action = undefined;
            _this._selection = undefined;
            _this.connect(_this.dropBox, 'drop', _this.onActionButtonDrop);
            _this.connect(_this, 'press', _this.onActionButtonDrop);
            _this.dropBox.addType('all', _this.onActionButtonEffect.bind(_this));
            return _this;
        }
        Object.defineProperty(ActionButton.prototype, "action", {
            set: function (action) {
                this._action = action;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionButton.prototype, "selection", {
            set: function (selection) {
                this._selection = selection;
            },
            enumerable: true,
            configurable: true
        });
        ActionButton.prototype.onActionButtonEffect = function (data, dataTransfer) {
            if ('draggable' in dataTransfer) {
                var elements = this._selection.getElements();
                var found = undefined;
                for (var i = 0; (found === undefined) && (i < elements.length); i++) {
                    if (elements[i] === dataTransfer.draggable)
                        found = elements[i];
                }
                if (found !== undefined)
                    return ['run'];
            }
            return [];
        };
        ActionButton.prototype.onActionButtonDrop = function () {
            var scope = this;
            if ('scope' in this._action)
                scope = this._action.scope;
            this._action.callback.call(scope, this._selection);
            this._selection.clear();
        };
        ActionButton.style = {
            textTransform: 'uppercase',
            radius: 0,
            borderWidth: 0,
            foreground: 'rgba(250,250,250,1)',
            background: 'rgba(60,60,60,0)',
            backgroundBorder: 'rgba(60,60,60,0)',
            focusColor: '#f6caa2'
        };
        return ActionButton;
    }(Ui.Button));
    Ui.ActionButton = ActionButton;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ContextBarCloseButton = (function (_super) {
        __extends(ContextBarCloseButton, _super);
        function ContextBarCloseButton() {
            return _super.call(this) || this;
        }
        ContextBarCloseButton.style = {
            textWidth: 5,
            radius: 0,
            borderWidth: 0,
            foreground: 'rgba(250,250,250,1)',
            background: 'rgba(60,60,60,0)'
        };
        return ContextBarCloseButton;
    }(Ui.Button));
    Ui.ContextBarCloseButton = ContextBarCloseButton;
    var ContextBar = (function (_super) {
        __extends(ContextBar, _super);
        function ContextBar() {
            var _this = _super.call(this) || this;
            _this.selection = undefined;
            _this.bg = new Ui.Rectangle();
            _this.append(_this.bg);
            var hbox = new Ui.HBox();
            hbox.spacing = 5;
            _this.append(hbox);
            _this.closeButton = new Ui.ContextBarCloseButton();
            _this.closeButton.icon = 'backarrow';
            hbox.append(_this.closeButton);
            _this.connect(_this.closeButton, 'press', _this.onClosePress);
            var scroll = new Ui.ScrollingArea();
            hbox.append(scroll, true);
            _this.actionsBox = new Ui.HBox();
            _this.actionsBox.spacing = 5;
            return _this;
        }
        ContextBar.prototype.setSelection = function (selection) {
            if (this.selection != undefined)
                this.disconnect(this.selection, 'change', this.onSelectionChange);
            this.selection = selection;
            if (this.selection != undefined)
                this.connect(this.selection, 'change', this.onSelectionChange);
        };
        ContextBar.prototype.onClosePress = function () {
            this.selection.clear();
        };
        ContextBar.prototype.onSelectionChange = function () {
            this.closeButton.text = this.selection.getElements().length.toString();
            var actions = this.selection.getActions();
            this.actionsBox.clear();
            for (var actionName in actions) {
                var action = actions[actionName];
                if (action.hidden === true)
                    continue;
                var button = new Ui.ActionButton();
                button.icon = action.icon;
                button.text = action.text;
                button.action = action;
                button.selection = this.selection;
                this.actionsBox.append(button);
            }
        };
        ContextBar.prototype.onStyleChange = function () {
            this.bg.fill = this.getStyleProperty('background');
        };
        ContextBar.style = {
            background: '#07a0e5'
        };
        return ContextBar;
    }(Ui.LBox));
    Ui.ContextBar = ContextBar;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup(init) {
            var _this = _super.call(this) || this;
            _this.posX = undefined;
            _this.posY = undefined;
            _this.attachedElement = undefined;
            _this.attachedBorder = undefined;
            _this._autoClose = true;
            _this._preferredWidth = undefined;
            _this._preferredHeight = undefined;
            _this.openClock = undefined;
            _this.isClosed = true;
            _this.addEvents('close');
            _this.horizontalAlign = 'stretch';
            _this.verticalAlign = 'stretch';
            _this.popupSelection = new Ui.Selection();
            _this.shadow = new Ui.Pressable();
            _this.shadow.focusable = false;
            _this.shadow.drawing.style.cursor = 'inherit';
            _this.appendChild(_this.shadow);
            _this.shadowGraphic = new Ui.Rectangle();
            _this.shadow.content = _this.shadowGraphic;
            _this.background = new PopupBackground();
            _this.background.radius = 0;
            _this.background.fill = '#f8f8f8';
            _this.background.setTransformOrigin(0, 0);
            _this.appendChild(_this.background);
            _this.contentBox = new Ui.LBox();
            _this.contentBox.margin = 2;
            _this.contentBox.marginTop = 1;
            _this.contentBox.setTransformOrigin(0, 0);
            _this.appendChild(_this.contentBox);
            _this.scroll = new Ui.ScrollingArea();
            _this.scroll.margin = 2;
            _this.scroll.marginTop = 1;
            _this.contentBox.append(_this.scroll);
            _this.contextBox = new Ui.ContextBar();
            _this.contextBox.setSelection(_this.popupSelection);
            _this.contextBox.verticalAlign = 'top';
            _this.contextBox.hide(true);
            _this.contentBox.append(_this.contextBox);
            _this.connect(_this.popupSelection, 'change', _this.onPopupSelectionChange);
            _this.connect(_this.shadow, 'press', _this.onShadowPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Popup.prototype, "preferredWidth", {
            set: function (width) {
                this._preferredWidth = width;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "preferredHeight", {
            set: function (height) {
                this._preferredHeight = height;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Popup.prototype.getSelectionHandler = function () {
            return this.popupSelection;
        };
        Object.defineProperty(Popup.prototype, "autoClose", {
            set: function (autoClose) {
                this._autoClose = autoClose;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "content", {
            get: function () {
                return this.scroll.content;
            },
            set: function (content) {
                this.scroll.content = content;
            },
            enumerable: true,
            configurable: true
        });
        Popup.prototype.onWindowResize = function () {
            if (this._autoClose && (this.posX !== undefined))
                this.close();
        };
        Popup.prototype.onShadowPress = function () {
            if (this._autoClose)
                this.close();
        };
        Popup.prototype.onOpenTick = function (clock, progress, delta) {
            var end = (progress >= 1);
            if (this.isClosed)
                progress = 1 - progress;
            this.opacity = progress;
            var arrowBorder = this.background.arrowBorder;
            var arrowOffset = this.background.arrowOffset;
            if (arrowBorder === 'right') {
                this.background.transform = Ui.Matrix.createTranslate(20 * (1 - progress), 0);
                this.contentBox.transform = Ui.Matrix.createTranslate(20 * (1 - progress), 0);
            }
            else if (arrowBorder === 'left') {
                this.background.transform = Ui.Matrix.createTranslate(-20 * (1 - progress), 0);
                this.contentBox.transform = Ui.Matrix.createTranslate(-20 * (1 - progress), 0);
            }
            else if ((arrowBorder === 'top') || (arrowBorder === 'none')) {
                this.background.transform = Ui.Matrix.createTranslate(0, -20 * (1 - progress));
                this.contentBox.transform = Ui.Matrix.createTranslate(0, -20 * (1 - progress));
            }
            else if (arrowBorder === 'bottom') {
                this.background.transform = Ui.Matrix.createTranslate(0, 20 * (1 - progress));
                this.contentBox.transform = Ui.Matrix.createTranslate(0, 20 * (1 - progress));
            }
            if (end) {
                this.openClock.stop();
                this.openClock = undefined;
                if (this.isClosed) {
                    Ui.App.current.removeDialog(this);
                    this.enable();
                }
            }
        };
        Popup.prototype.onPopupSelectionChange = function (selection) {
            if (selection.getElements().length === 0)
                this.contextBox.hide(true);
            else
                this.contextBox.show();
        };
        Popup.prototype.onStyleChange = function () {
            this.background.fill = this.getStyleProperty('background');
            this.shadowGraphic.fill = this.getStyleProperty('shadow');
        };
        Popup.prototype.onChildInvalidateMeasure = function (child, type) {
            this.invalidateLayout();
        };
        Popup.prototype.onChildInvalidateArrange = function (child) {
            this.invalidateLayout();
        };
        Popup.prototype.open = function () {
            this.openPosOrElement();
        };
        Popup.prototype.openAt = function (posX, posY) {
            this.openPosOrElement(posX, posY);
        };
        Popup.prototype.openElement = function (element, position) {
            this.openPosOrElement(element, position);
        };
        Popup.prototype.openPosOrElement = function (posX, posY) {
            if (this.isClosed) {
                Ui.App.current.appendDialog(this);
                this.isClosed = false;
                this.attachedElement = undefined;
                this.posX = undefined;
                this.posY = undefined;
                if ((typeof (posX) == 'object') && (posX instanceof Ui.Element)) {
                    this.attachedElement = posX;
                    if ((posY !== undefined) && (typeof (posY) === 'string'))
                        this.attachedBorder = posY;
                    var point = this.attachedElement.pointToWindow(new Ui.Point(this.attachedElement.layoutWidth, this.attachedElement.layoutHeight / 2));
                    this.posX = point.x;
                    this.posY = point.y;
                }
                else if ((posX !== undefined) && (posY !== undefined)) {
                    this.posX = posX;
                    this.posY = posY;
                }
                else {
                    this.posX = undefined;
                    this.posY = undefined;
                }
                if (this.openClock === undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.opacity = 0;
                }
                this.invalidateArrange();
                this.connect(window, 'resize', this.onWindowResize);
            }
        };
        Popup.prototype.close = function () {
            if (!this.isClosed) {
                this.isClosed = true;
                this.fireEvent('close', this);
                this.disconnect(window, 'resize', this.onWindowResize);
                this.disable();
                if (this.openClock === undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.openClock.begin();
                }
            }
        };
        Popup.prototype.measureCore = function (width, height) {
            var constraintWidth = Math.max(width - 40, 0);
            var constraintHeight = Math.max(height - 40, 0);
            console.log("Popup.measureCore(" + width + "," + height + ")");
            if ((this._preferredWidth !== undefined) && (this._preferredWidth < constraintWidth))
                constraintWidth = this._preferredWidth;
            if ((this._preferredHeight !== undefined) && (this._preferredHeight < constraintHeight))
                constraintHeight = this._preferredHeight;
            this.background.measure(constraintWidth, constraintHeight);
            var size = this.contentBox.measure(constraintWidth, constraintHeight);
            if ((this.posX !== undefined) || (this.attachedElement !== undefined))
                return { width: Math.max(50, size.width), height: Math.max(50, size.height) };
            else
                return { width: Math.max(width, size.width + 40), height: Math.max(height, size.height + 40) };
        };
        Popup.prototype.arrangeCore = function (width, height) {
            console.log("Popup.arrangeCore(" + width + "," + height + ")");
            if ((this.openClock !== undefined) && !this.openClock.isActive)
                this.openClock.begin();
            var x = 0;
            var y = 0;
            var point;
            var borders;
            var border;
            var i;
            this.shadow.arrange(0, 0, width, height);
            if (((this.posX === undefined) && (this.attachedElement === undefined)) || (width < 150) || (height < 150)) {
                this.setCenter(width, height);
            }
            else if (this.attachedElement !== undefined) {
                borders = ['right', 'left', 'top', 'bottom', 'center'];
                if (this.attachedBorder !== undefined)
                    borders.unshift(this.attachedBorder);
                for (i = 0; i < borders.length; i++) {
                    border = borders[i];
                    if (border === 'left') {
                        point = this.attachedElement.pointToWindow(new Ui.Point(0, this.attachedElement.layoutHeight / 2));
                        if (this.contentBox.measureWidth + 10 < point.x) {
                            this.setLeft(point.x, point.y, width, height);
                            break;
                        }
                    }
                    else if (border === 'right') {
                        point = this.attachedElement.pointToWindow(new Ui.Point(this.attachedElement.layoutWidth, this.attachedElement.layoutHeight / 2));
                        if (this.contentBox.measureWidth + point.x + 10 < width) {
                            this.setRight(point.x, point.y, width, height);
                            break;
                        }
                    }
                    else if (border === 'top') {
                        point = this.attachedElement.pointToWindow(new Ui.Point(this.attachedElement.layoutWidth / 2, 0));
                        if (this.contentBox.measureHeight + 10 < point.y) {
                            this.setTop(point.x, point.y, width, height);
                            break;
                        }
                    }
                    else if (border === 'bottom') {
                        point = this.attachedElement.pointToWindow(new Ui.Point(this.attachedElement.layoutWidth / 2, this.attachedElement.layoutHeight));
                        if (this.contentBox.measureHeight + 10 + point.y < height) {
                            this.setBottom(point.x, point.y, width, height);
                            break;
                        }
                    }
                    else {
                        this.setCenter(width, height);
                        break;
                    }
                }
            }
            else {
                borders = ['right', 'left', 'top', 'bottom', 'center'];
                if (this.attachedBorder !== undefined)
                    borders.unshift(this.attachedBorder);
                for (i = 0; i < borders.length; i++) {
                    border = borders[i];
                    if (border === 'left') {
                        if (this.contentBox.measureWidth + 10 < this.posX) {
                            this.setLeft(this.posX, this.posY, width, height);
                            break;
                        }
                    }
                    else if (border === 'right') {
                        if (this.contentBox.measureWidth + this.posX + 10 < width) {
                            this.setRight(this.posX, this.posY, width, height);
                            break;
                        }
                    }
                    else if (border === 'top') {
                        if (this.contentBox.measureHeight + 10 < this.posY) {
                            this.setTop(this.posX, this.posY, width, height);
                            break;
                        }
                    }
                    else if (border === 'bottom') {
                        if (this.contentBox.measureHeight + 10 + this.posY < height) {
                            this.setBottom(this.posX, this.posY, width, height);
                            break;
                        }
                    }
                    else {
                        this.setCenter(width, height);
                        break;
                    }
                }
            }
        };
        Popup.prototype.setRight = function (x, y, width, height) {
            var px = x + 10;
            var py = y - 30;
            this.background.arrowBorder = 'left';
            if (py + this.contentBox.measureHeight > height) {
                py = height - this.contentBox.measureHeight;
                var offset = y - py;
                if (offset > this.contentBox.measureHeight - 18)
                    offset = this.contentBox.measureHeight - 18;
                this.background.arrowOffset = offset;
            }
            else
                this.background.arrowOffset = 30;
            this.background.arrange(px - 10, py, this.contentBox.measureWidth + 10, this.contentBox.measureHeight);
            this.contentBox.arrange(px, py, this.contentBox.measureWidth, this.contentBox.measureHeight);
        };
        Popup.prototype.setLeft = function (x, y, width, height) {
            var px = x - (10 + this.contentBox.measureWidth);
            var py = y - 30;
            this.background.arrowBorder = 'right';
            if (py + this.contentBox.measureHeight > height) {
                py = height - this.contentBox.measureHeight;
                var offset = y - py;
                if (offset > this.contentBox.measureHeight - 18)
                    offset = this.contentBox.measureHeight - 18;
                this.background.arrowOffset = offset;
            }
            else
                this.background.arrowOffset = 30;
            this.background.arrange(px, py, this.contentBox.measureWidth + 10, this.contentBox.measureHeight);
            this.contentBox.arrange(px, py, this.contentBox.measureWidth, this.contentBox.measureHeight);
        };
        Popup.prototype.setTop = function (x, y, width, height) {
            var py = y - (this.contentBox.measureHeight);
            var px = x - 30;
            this.background.arrowBorder = 'bottom';
            if (px + this.contentBox.measureWidth > width) {
                px = width - this.contentBox.measureWidth;
                var offset = x - px;
                if (offset > this.contentBox.measureWidth - 18)
                    offset = this.contentBox.measureWidth - 18;
                this.background.arrowOffset = offset;
            }
            else if (px < 2) {
                this.background.arrowOffset = x + 2;
                px = 2;
            }
            else
                this.background.arrowOffset = 30;
            this.background.arrange(px, py - 10, this.contentBox.measureWidth, this.contentBox.measureHeight + 10);
            this.contentBox.arrange(px, py - 10, this.contentBox.measureWidth, this.contentBox.measureHeight);
        };
        Popup.prototype.setBottom = function (x, y, width, height) {
            var py = y + 10;
            var px = x - 30;
            this.background.arrowBorder = 'top';
            if (px + this.contentBox.measureWidth > width) {
                px = width - this.contentBox.measureWidth;
                var offset = x - px;
                if (offset > this.contentBox.measureWidth - 18)
                    offset = this.contentBox.measureWidth - 18;
                this.background.arrowOffset = offset;
            }
            else if (px < 2) {
                this.background.arrowOffset = x + 2;
                px = 2;
            }
            else
                this.background.arrowOffset = 30;
            this.background.arrange(px, py - 10, this.contentBox.measureWidth, this.contentBox.measureHeight + 10);
            this.contentBox.arrange(px, py, this.contentBox.measureWidth, this.contentBox.measureHeight);
        };
        Popup.prototype.setCenter = function (width, height) {
            this.background.arrowBorder = 'none';
            var x = (width - this.contentBox.measureWidth) / 2;
            var y = (height - this.contentBox.measureHeight) / 2;
            this.background.arrange(x, y, this.contentBox.measureWidth, this.contentBox.measureHeight);
            this.contentBox.arrange(x, y, this.contentBox.measureWidth, this.contentBox.measureHeight);
        };
        Popup.style = {
            background: '#f8f8f8',
            shadow: new Ui.Color(1, 1, 1, 0.1)
        };
        return Popup;
    }(Ui.Container));
    Ui.Popup = Popup;
    var PopupBackground = (function (_super) {
        __extends(PopupBackground, _super);
        function PopupBackground() {
            var _this = _super.call(this) || this;
            _this._radius = 8;
            _this._arrowBorder = 'left';
            _this._arrowOffset = 30;
            _this.arrowSize = 10;
            _this.fill = 'black';
            return _this;
        }
        Object.defineProperty(PopupBackground.prototype, "arrowBorder", {
            get: function () {
                return this._arrowBorder;
            },
            set: function (arrowBorder) {
                if (this._arrowBorder != arrowBorder) {
                    this._arrowBorder = arrowBorder;
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupBackground.prototype, "arrowOffset", {
            get: function () {
                return this._arrowOffset;
            },
            set: function (offset) {
                if (this._arrowOffset != offset) {
                    this._arrowOffset = offset;
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupBackground.prototype, "radius", {
            set: function (radius) {
                if (this._radius != radius) {
                    this._radius = radius;
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupBackground.prototype, "fill", {
            set: function (fill) {
                if (this._fill != fill) {
                    this._fill = Ui.Color.create(fill);
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        PopupBackground.prototype.genPath = function (width, height, radius, arrowBorder, arrowSize, arrowOffset) {
            var v1;
            var v2;
            if (arrowBorder == 'none') {
                v1 = width - radius;
                v2 = height - radius;
                return 'M' + radius + ',0 L' + v1 + ',0 Q' + width + ',0 ' + width + ',' + radius + ' L' + width + ',' + v2 + ' Q' + width + ',' + height + ' ' + v1 + ',' + height + ' L' + radius + ',' + height + ' Q0,' + height + ' 0,' + v2 + ' L0,' + radius + ' Q0,0 ' + radius + ',0 z';
            }
            else if (arrowBorder == 'left') {
                v1 = width - this._radius;
                v2 = height - this._radius;
                return 'M' + (radius + arrowSize) + ',0 L' + v1 + ',0 Q' + width + ',0 ' + width + ',' + radius + ' L' + width + ',' + v2 + ' Q' + width + ',' + height + ' ' + v1 + ',' + height + ' L' + (radius + arrowSize) + ',' + height + ' Q' + arrowSize + ',' + height + ' ' + arrowSize + ',' + v2 + ' L' + arrowSize + ',' + (arrowOffset + arrowSize) + ' L0,' + arrowOffset + ' L' + arrowSize + ',' + (arrowOffset - arrowSize) + ' L' + arrowSize + ',' + radius + ' Q' + arrowSize + ',0 ' + (radius + arrowSize) + ',0 z';
            }
            else if (arrowBorder == 'right') {
                v1 = width - (this._radius + arrowSize);
                v2 = height - this._radius;
                return 'M' + radius + ',0 L' + v1 + ',0 Q' + (width - arrowSize) + ',0 ' + (width - arrowSize) + ',' + radius + ' L' + (width - arrowSize) + ',' + (arrowOffset - arrowSize) + ' L' + width + ',' + arrowOffset + ' L' + (width - arrowSize) + ',' + (arrowOffset + arrowSize) + ' L ' + (width - arrowSize) + ',' + v2 + ' Q' + (width - arrowSize) + ',' + height + ' ' + v1 + ',' + height + ' L' + radius + ',' + height + ' Q0,' + height + ' 0,' + v2 + ' L0,' + radius + ' Q0,0 ' + radius + ',0 z';
            }
            else if (arrowBorder == 'top') {
                v1 = width - this._radius;
                v2 = height - this._radius;
                return 'M' + radius + ',' + arrowSize + ' L' + (arrowOffset - arrowSize) + ',' + arrowSize + ' L' + arrowOffset + ',0 L' + (arrowOffset + arrowSize) + ',' + arrowSize + ' L' + v1 + ',' + arrowSize + ' Q' + width + ',' + arrowSize + ' ' + width + ',' + (arrowSize + radius) + ' L' + width + ',' + v2 + ' Q' + width + ',' + height + ' ' + v1 + ',' + height + ' L' + radius + ',' + height + ' Q0,' + height + ' 0,' + v2 + ' L0,' + (arrowSize + radius) + ' Q0,' + arrowSize + ' ' + radius + ',' + arrowSize + ' z';
            }
            else if (arrowBorder == 'bottom') {
                v1 = width - this._radius;
                v2 = height - (this._radius + arrowSize);
                return 'M' + radius + ',0 L' + v1 + ',0 Q' + width + ',0 ' + width + ',' + radius + ' L' + width + ',' + v2 + ' Q' + width + ',' + (height - arrowSize) + ' ' + v1 + ',' + (height - arrowSize) + ' L ' + (arrowOffset + arrowSize) + ',' + (height - arrowSize) + ' L' + arrowOffset + ',' + height + ' L' + (arrowOffset - arrowSize) + ',' + (height - arrowSize) + ' L' + radius + ',' + (height - arrowSize) + ' Q0,' + (height - arrowSize) + ' 0,' + v2 + ' L0,' + radius + ' Q0,0 ' + radius + ',0 z';
            }
        };
        PopupBackground.prototype.updateCanvas = function (ctx) {
            var width = this.layoutWidth;
            var height = this.layoutHeight;
            if (this.arrowBorder == 'none') {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(1, 1, width - 2, height - 2);
                ctx.fillStyle = this._fill.getCssRgba();
                ctx.fillRect(2, 2, width - 4, height - 4);
            }
            else {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.svgPath(this.genPath(width, height, this._radius, this.arrowBorder, this.arrowSize, this._arrowOffset));
                ctx.fill();
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.translate(1, 1);
                ctx.svgPath(this.genPath(width - 2, height - 2, this._radius - 1, this.arrowBorder, this.arrowSize - 1, this._arrowOffset - 1));
                ctx.fill();
                ctx.restore();
                ctx.fillStyle = this._fill.getCssRgba();
                ctx.translate(2, 2);
                ctx.svgPath(this.genPath(width - 4, height - 4, this._radius - 2, this.arrowBorder, this.arrowSize - 1, this._arrowOffset - 2));
                ctx.fill();
            }
        };
        return PopupBackground;
    }(Ui.CanvasElement));
    Ui.PopupBackground = PopupBackground;
    var MenuPopup = (function (_super) {
        __extends(MenuPopup, _super);
        function MenuPopup(init) {
            var _this = _super.call(this) || this;
            if (init)
                _this.assign(init);
            return _this;
        }
        return MenuPopup;
    }(Popup));
    Ui.MenuPopup = MenuPopup;
    var MenuPopupSeparator = (function (_super) {
        __extends(MenuPopupSeparator, _super);
        function MenuPopupSeparator() {
            return _super.call(this) || this;
        }
        return MenuPopupSeparator;
    }(Ui.Separator));
    Ui.MenuPopupSeparator = MenuPopupSeparator;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var MenuToolBarPopup = (function (_super) {
        __extends(MenuToolBarPopup, _super);
        function MenuToolBarPopup() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MenuToolBarPopup;
    }(Ui.MenuPopup));
    Ui.MenuToolBarPopup = MenuToolBarPopup;
    var MenuToolBarButton = (function (_super) {
        __extends(MenuToolBarButton, _super);
        function MenuToolBarButton() {
            var _this = _super.call(this) || this;
            _this.icon = 'arrowbottom';
            return _this;
        }
        return MenuToolBarButton;
    }(Ui.Button));
    Ui.MenuToolBarButton = MenuToolBarButton;
    var MenuToolBar = (function (_super) {
        __extends(MenuToolBar, _super);
        function MenuToolBar() {
            var _this = _super.call(this) || this;
            _this.paddingTop = 0;
            _this.paddingBottom = 0;
            _this.paddingLeft = 0;
            _this.paddingRight = 0;
            _this.star = 0;
            _this.measureLock = undefined;
            _this.items = undefined;
            _this.menuButton = undefined;
            _this.itemsAlign = 'left';
            _this.menuPosition = 'right';
            _this.uniform = false;
            _this.uniformSize = 0;
            _this.spacing = 0;
            _this.itemsWidth = 0;
            _this.keepItems = undefined;
            _this.menuNeeded = false;
            _this.bg = undefined;
            _this.items = [];
            _this.bg = new Ui.Rectangle();
            _this.appendChild(_this.bg);
            _this.menuButton = new Ui.MenuToolBarButton();
            _this.connect(_this.menuButton, 'press', _this.onMenuButtonPress);
            _this.appendChild(_this.menuButton);
            return _this;
        }
        MenuToolBar.prototype.getUniform = function () {
            return this.uniform;
        };
        MenuToolBar.prototype.setUniform = function (uniform) {
            if (this.uniform !== uniform) {
                this.uniform = uniform;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.getMenuPosition = function () {
            return this.menuPosition;
        };
        MenuToolBar.prototype.setMenuPosition = function (menuPosition) {
            if (this.menuPosition !== menuPosition) {
                this.menuPosition = menuPosition;
                this.invalidateArrange();
            }
        };
        MenuToolBar.prototype.getItemsAlign = function () {
            return this.itemsAlign;
        };
        MenuToolBar.prototype.setItemsAlign = function (align) {
            if (this.itemsAlign !== align) {
                this.itemsAlign = align;
                this.invalidateArrange();
            }
        };
        MenuToolBar.prototype.getLogicalChildren = function () {
            return this.items;
        };
        MenuToolBar.prototype.setPadding = function (padding) {
            this.setPaddingTop(padding);
            this.setPaddingBottom(padding);
            this.setPaddingLeft(padding);
            this.setPaddingRight(padding);
        };
        MenuToolBar.prototype.getPaddingTop = function () {
            return this.paddingTop;
        };
        MenuToolBar.prototype.setPaddingTop = function (paddingTop) {
            if (this.paddingTop !== paddingTop) {
                this.paddingTop = paddingTop;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.getPaddingBottom = function () {
            return this.paddingBottom;
        };
        MenuToolBar.prototype.setPaddingBottom = function (paddingBottom) {
            if (this.paddingBottom !== paddingBottom) {
                this.paddingBottom = paddingBottom;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.getPaddingLeft = function () {
            return this.paddingLeft;
        };
        MenuToolBar.prototype.setPaddingLeft = function (paddingLeft) {
            if (this.paddingLeft !== paddingLeft) {
                this.paddingLeft = paddingLeft;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.getPaddingRight = function () {
            return this.paddingRight;
        };
        MenuToolBar.prototype.setPaddingRight = function (paddingRight) {
            if (this.paddingRight !== paddingRight) {
                this.paddingRight = paddingRight;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.getSpacing = function () {
            return this.spacing;
        };
        MenuToolBar.prototype.setSpacing = function (spacing) {
            if (this.spacing !== spacing) {
                this.spacing = spacing;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.append = function (child, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            this.items.push(child);
            this.invalidateMeasure();
        };
        MenuToolBar.prototype.prepend = function (child, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            this.items.unshift(child);
            this.invalidateMeasure();
        };
        MenuToolBar.prototype.remove = function (child) {
            var i = 0;
            while ((i < this.items.length) && (this.items[i] !== child)) {
                i++;
            }
            if (i < this.items.length) {
                this.items.splice(i, 1);
                if ((child.parent === this) && (child.parent instanceof Ui.Container))
                    child.parent.removeChild(child);
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.moveAt = function (child, position) {
            if (position < 0)
                position = this.items.length + position;
            if (position < 0)
                position = 0;
            if (position >= this.items.length)
                position = this.items.length;
            var i = 0;
            while ((i < this.items.length) && (this.items[i] !== child)) {
                i++;
            }
            if (i < this.items.length) {
                this.items.splice(i, 1);
                this.items.splice(position, 0, child);
            }
            this.onChildInvalidateMeasure(child, 'move');
        };
        MenuToolBar.prototype.insertAt = function (child, position, resizable) {
            if (resizable !== undefined)
                Ui.Box.setResizable(child, resizable === true);
            position = Math.max(0, Math.min(position, this.items.length));
            this.items.splice(position, 0, child);
            this.invalidateMeasure();
        };
        MenuToolBar.prototype.setContent = function (content) {
            if (content === undefined)
                this.clear();
            else if (typeof (content) === 'object') {
                if (content.constructor !== Array) {
                    content = [content];
                }
                for (var i = 0; i < this.items.length; i++) {
                    var found = false;
                    for (var i2 = 0; (found === false) && (i2 < content.length); i2++) {
                        found = (this.items[i] === content[i2]);
                    }
                    if ((found === false) && (this.items[i].parent === this))
                        this.removeChild(this.items[i]);
                }
                this.items = content;
                this.invalidateMeasure();
            }
        };
        MenuToolBar.prototype.onMenuButtonPress = function () {
            var dialog = new Ui.MenuToolBarPopup();
            var vbox = new Ui.VBox();
            dialog.content = vbox;
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.parent !== this) {
                    vbox.append(item);
                    if (i < this.items.length - 1)
                        vbox.append(new Ui.MenuPopupSeparator());
                }
            }
            dialog.openElement(this.menuButton, 'bottom');
        };
        MenuToolBar.prototype.clear = function () {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].parent === this)
                    this.items[i].parent.removeChild(this.items[i]);
            }
            this.items = [];
            this.invalidateMeasure();
        };
        MenuToolBar.prototype.measureCore = function (width, height) {
            var left = this.getPaddingLeft();
            var right = this.getPaddingRight();
            var top = this.getPaddingTop();
            var bottom = this.getPaddingBottom();
            var constraintWidth = Math.max(0, width - (left + right));
            var constraintHeight = Math.max(0, height - (top + bottom));
            var size;
            var i;
            this.bg.measure(width, height);
            this.measureLock = true;
            var buttonSize = this.menuButton.measure(0, 0);
            var minSizes = [];
            for (i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.parent !== this) {
                    if ((item.parent != undefined) && (item.parent instanceof Ui.Container))
                        item.parent.removeChild(item);
                    this.appendChild(item);
                }
                minSizes.push(item.measure(0, 0));
            }
            this.keepItems = [];
            var totalWidth = 0;
            var countResizable = 0;
            var maxItemWidth = 0;
            var maxItemHeight = buttonSize.height;
            var minItemsSize = 0;
            i = (this.menuPosition === 'left') ? (i = this.items.length - 1) : 0;
            while ((i >= 0) && (i < this.items.length)) {
                var minSize = minSizes[i];
                if (totalWidth + minSize.width + this.spacing > constraintWidth)
                    break;
                totalWidth += minSize.width + this.spacing;
                if (totalWidth + buttonSize.width > constraintWidth)
                    break;
                if (this.menuPosition === 'left')
                    this.keepItems.unshift(this.items[i]);
                else
                    this.keepItems.push(this.items[i]);
                if (Ui.Box.getResizable(this.items[i]))
                    countResizable++;
                else {
                    minItemsSize += minSize.width;
                    if (minSize.height > maxItemHeight)
                        maxItemHeight = minSize.height;
                }
                if (minSize.width > maxItemWidth)
                    maxItemWidth = minSize.width;
                if (this.menuPosition === 'left')
                    i--;
                else
                    i++;
            }
            if (totalWidth > 0)
                totalWidth -= this.spacing;
            this.menuNeeded = this.keepItems.length !== this.items.length;
            var constraintSize = constraintWidth;
            if (this.menuNeeded) {
                constraintSize -= buttonSize.width + this.spacing;
                while ((i >= 0) && (i < this.items.length)) {
                    this.removeChild(this.items[i]);
                    if (this.menuPosition === 'left')
                        i--;
                    else
                        i++;
                }
            }
            if (this.uniform) {
                if ((this.keepItems.length * (maxItemWidth + this.spacing)) - this.spacing <= constraintWidth) {
                    for (i = 0; i < this.keepItems.length; i++)
                        this.keepItems[i].measure(maxItemWidth, maxItemHeight);
                    this.uniformSize = maxItemWidth;
                    size = { width: ((this.keepItems.length * (maxItemWidth + this.spacing)) - this.spacing), height: maxItemHeight };
                }
                else {
                    this.uniformSize = undefined;
                    size = { width: totalWidth, height: maxItemHeight };
                }
            }
            else {
                if (countResizable > 0) {
                    var remainWidth = constraintSize - minItemsSize - ((this.keepItems.length - 1) * this.spacing);
                    var starFound = true;
                    var star = remainWidth / countResizable;
                    do {
                        starFound = true;
                        for (i = 0; i < this.keepItems.length; i++) {
                            var child = this.keepItems[i];
                            if (Ui.Box.getResizable(child)) {
                                if (!child.menutoolbarStarDone) {
                                    size = child.measure(star, constraintHeight);
                                    if (size.height > maxItemHeight)
                                        maxItemHeight = size.height;
                                    if (size.width > star) {
                                        child.menutoolbarStarDone = true;
                                        starFound = false;
                                        remainWidth -= size.width;
                                        minItemsSize += size.width;
                                        countResizable--;
                                        star = remainWidth / countResizable;
                                        break;
                                    }
                                }
                            }
                        }
                    } while (!starFound);
                    minItemsSize += this.spacing * (this.keepItems.length - 1);
                    if (countResizable > 0) {
                        minItemsSize += star * countResizable;
                        this.star = star;
                    }
                    else
                        this.star = 0;
                    size = { width: minItemsSize, height: maxItemHeight };
                }
                else
                    size = { width: totalWidth, height: maxItemHeight };
            }
            if (this.menuNeeded)
                size.width += buttonSize.width + this.spacing;
            size.width += left + right;
            size.height += top + bottom;
            this.measureLock = undefined;
            return size;
        };
        MenuToolBar.prototype.arrangeCore = function (width, height) {
            this.bg.arrange(0, 0, width, height);
            var left = this.paddingLeft;
            var right = this.paddingRight;
            var top = this.paddingTop;
            var bottom = this.paddingBottom;
            width -= left + right;
            height -= top + bottom;
            var x = left;
            var y = top;
            var first = true;
            if (this.itemsAlign !== 'left')
                x = width - this.measureWidth;
            if (this.menuNeeded && (this.menuPosition === 'left')) {
                first = false;
                this.menuButton.arrange(x, y, this.menuButton.measureWidth, height);
                x += this.menuButton.measureWidth;
            }
            for (var i = 0; i < this.keepItems.length; i++) {
                var item = this.keepItems[i];
                if (first)
                    first = false;
                else
                    x += this.spacing;
                var itemWidth = void 0;
                if (this.uniform && (this.uniformSize !== undefined))
                    itemWidth = this.uniformSize;
                else {
                    itemWidth = item.measureWidth;
                    if (Ui.Box.getResizable(item) && (itemWidth < this.star))
                        itemWidth = this.star;
                }
                item.arrange(x, y, itemWidth, height);
                x += itemWidth;
            }
            if (this.menuNeeded && (this.menuPosition !== 'left')) {
                if (first)
                    first = false;
                else
                    x += this.spacing;
                this.menuButton.arrange(x, y, this.menuButton.measureWidth, height);
            }
            if (!this.menuNeeded)
                this.menuButton.drawing.style.visibility = 'hidden';
            else
                this.menuButton.drawing.style.visibility = '';
        };
        MenuToolBar.prototype.onChildInvalidateMeasure = function (child, event) {
            if (this.measureLock !== true)
                _super.prototype.onChildInvalidateMeasure.call(this, child, event);
        };
        MenuToolBar.prototype.onStyleChange = function () {
            this.bg.fill = this.getStyleProperty('background');
        };
        MenuToolBar.style = {
            background: 'rgba(250, 250, 250, 0)'
        };
        return MenuToolBar;
    }(Ui.Container));
    Ui.MenuToolBar = MenuToolBar;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var App = (function (_super) {
        __extends(App, _super);
        function App(init) {
            var _this = _super.call(this) || this;
            _this.styles = undefined;
            _this.updateTask = false;
            _this.loaded = false;
            _this.focusElement = undefined;
            _this.arguments = undefined;
            _this.ready = false;
            _this.orientation = 0;
            _this.webApp = true;
            _this.lastArrangeHeight = 0;
            _this.drawList = undefined;
            _this.layoutList = undefined;
            _this.windowWidth = 0;
            _this.windowHeight = 0;
            _this.contentBox = undefined;
            _this._content = undefined;
            _this.dialogs = undefined;
            _this.topLayers = undefined;
            _this.requireFonts = undefined;
            _this.testFontTask = undefined;
            _this.bindedUpdate = undefined;
            _this.selection = undefined;
            var args;
            _this.addEvents('resize', 'ready', 'parentmessage', 'orientationchange');
            _this.clipToBounds = true;
            Ui.App.current = _this;
            _this.drawing.style.cursor = 'default';
            _this.selection = new Ui.Selection();
            _this.connect(_this.selection, 'change', _this.onSelectionChange);
            if ((window.location.search !== undefined) && (window.location.search !== '')) {
                var base64 = void 0;
                args = {};
                var tab = window.location.search.substring(1).split('&');
                for (var i = 0; i < tab.length; i++) {
                    var tab2 = tab[i].split('=');
                    if (tab2.length == 2) {
                        var key = decodeURIComponent(tab2[0]);
                        var val = decodeURIComponent(tab2[1]);
                        if (key === 'base64')
                            base64 = JSON.parse(Core.Util.fromBase64(val));
                        else
                            args[key] = val;
                    }
                }
                if (base64 !== undefined) {
                    _this.arguments = base64;
                    for (var prop in args)
                        _this.arguments[prop] = args[prop];
                }
                else
                    _this.arguments = args;
            }
            else
                _this.arguments = {};
            if (_this.arguments.remotedebug !== undefined) {
                args = _this.arguments.remotedebug.split(':');
                new Core.RemoteDebug({ host: args[0], port: args[1] });
            }
            _this.contentBox = new Ui.VBox();
            _this.append(_this.contentBox);
            _this.setTransformOrigin(0, 0);
            _this.connect(window, 'load', _this.onWindowLoad);
            _this.connect(window, 'resize', _this.onWindowResize);
            _this.connect(window, 'keyup', _this.onWindowKeyUp);
            _this.connect(window, 'focus', function (event) {
                if (event.target == undefined)
                    return;
                this.focusElement = event.target;
            }, true);
            _this.connect(window, 'blur', function (event) {
                this.focusElement = undefined;
            }, true);
            _this.connect(window, 'dragstart', function (event) { event.preventDefault(); });
            _this.connect(window, 'dragenter', function (event) { event.preventDefault(); return false; });
            _this.connect(window, 'dragover', function (event) {
                event.dataTransfer.dropEffect = 'none';
                event.preventDefault();
                return false;
            });
            _this.connect(window, 'drop', function (event) { event.preventDefault(); return false; });
            if ('onorientationchange' in window)
                _this.connect(window, 'orientationchange', _this.onOrientationChange);
            _this.connect(window, 'message', _this.onMessage);
            _this.bindedUpdate = _this.update.bind(_this);
            if (init)
                _this.assign(init);
            return _this;
        }
        App.prototype.setWebApp = function (webApp) {
            this.webApp = webApp;
        };
        App.prototype.getSelectionHandler = function () {
            return this.selection;
        };
        App.prototype.forceInvalidateMeasure = function (element) {
            if (element === undefined)
                element = this;
            if ('getChildren' in element) {
                for (var i = 0; i < element.getChildren().length; i++)
                    this.forceInvalidateMeasure(element.getChildren()[i]);
            }
            element.invalidateMeasure();
        };
        App.prototype.requireFont = function (fontFamily, fontWeight) {
            var fontKey = fontFamily + ':' + fontWeight;
            if (this.requireFonts === undefined)
                this.requireFonts = {};
            if (!this.requireFonts[fontKey]) {
                var test = false;
                if (this.isReady)
                    test = Ui.Label.isFontAvailable(fontFamily, fontWeight);
                this.requireFonts[fontKey] = test;
                if (test)
                    this.forceInvalidateMeasure(this);
                else if (this.isReady && !test && (this.testFontTask === undefined))
                    this.testFontTask = new Core.DelayedTask(this, 0.25, this.testRequireFonts);
            }
        };
        App.prototype.testRequireFonts = function () {
            var allDone = true;
            for (var fontKey in this.requireFonts) {
                var test = this.requireFonts[fontKey];
                if (!test) {
                    var fontTab = fontKey.split(':');
                    test = Ui.Label.isFontAvailable(fontTab[0], fontTab[1]);
                    if (test) {
                        this.requireFonts[fontKey] = true;
                        var app = this;
                        this.forceInvalidateMeasure(this);
                    }
                    else
                        allDone = false;
                }
            }
            if (!allDone)
                this.testFontTask = new Core.DelayedTask(this, 0.25, this.testRequireFonts);
            else
                this.testFontTask = undefined;
        };
        App.prototype.checkWindowSize = function () {
            var innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
            var innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;
            if ((innerWidth !== this.layoutWidth) || (innerHeight !== this.layoutHeight))
                this.invalidateMeasure();
        };
        App.prototype.getOrientation = function () {
            return this.orientation;
        };
        App.prototype.onSelectionChange = function (selection) {
        };
        App.prototype.onWindowLoad = function () {
            var meta;
            var style;
            if (Core.Navigator.iPad || Core.Navigator.iPhone || Core.Navigator.Android) {
                if (this.webApp) {
                    meta = document.createElement('meta');
                    meta.name = 'apple-mobile-web-app-capable';
                    meta.content = 'yes';
                    document.getElementsByTagName("head")[0].appendChild(meta);
                    meta = document.createElement('meta');
                    meta.name = 'apple-mobile-web-app-status-bar-style';
                    meta.content = 'black';
                    document.getElementsByTagName("head")[0].appendChild(meta);
                    meta = document.createElement('meta');
                    meta.name = 'mobile-web-app-capable';
                    meta.content = 'yes';
                    document.getElementsByTagName("head")[0].appendChild(meta);
                }
            }
            meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.getElementsByTagName("head")[0].appendChild(meta);
            if (Core.Navigator.isWebkit) {
                style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '* { -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }';
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            else if (Core.Navigator.isIE) {
                style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML =
                    '@-ms-viewport { width: device-width; } ' +
                        'body { -ms-content-zooming: none; } ' +
                        '* { touch-action: none; } ';
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            this.loaded = true;
            this.onReady();
        };
        App.prototype.onWindowResize = function (event) {
            this.checkWindowSize();
        };
        App.prototype.onOrientationChange = function (event) {
            this.orientation = window.orientation;
            this.fireEvent('orientationchange', this.orientation);
            this.checkWindowSize();
        };
        App.prototype.update = function () {
            var innerWidth = document.body.clientWidth;
            var innerHeight = document.body.clientHeight;
            if ((this.windowWidth !== innerWidth) || (this.windowHeight !== innerHeight)) {
                this.windowWidth = innerWidth;
                this.windowHeight = innerHeight;
                this.fireEvent('resize', this, this.windowWidth, this.windowHeight);
                this.invalidateLayout();
            }
            while (this.layoutList != undefined) {
                var next = this.layoutList.layoutNext;
                this.layoutList.layoutValid = true;
                this.layoutList.layoutNext = undefined;
                this.layoutList.updateLayout(this.windowWidth, this.windowHeight);
                this.layoutList = next;
            }
            while (this.drawList != undefined) {
                var next = this.drawList.drawNext;
                this.drawList.drawNext = undefined;
                this.drawList.draw();
                this.drawList = next;
            }
            this.updateTask = false;
        };
        Object.defineProperty(App.prototype, "content", {
            get: function () {
                return this._content;
            },
            set: function (content) {
                if (this._content !== content) {
                    if (this._content !== undefined)
                        this.contentBox.remove(this._content);
                    if (content !== undefined)
                        this.contentBox.prepend(content, true);
                    this._content = content;
                }
            },
            enumerable: true,
            configurable: true
        });
        App.prototype.getFocusElement = function () {
            return this.focusElement;
        };
        App.prototype.appendDialog = function (dialog) {
            if (this.dialogs === undefined) {
                this.dialogs = new Ui.LBox();
                this.dialogs.eventsHidden = true;
                if (this.topLayers !== undefined)
                    this.insertBefore(this.dialogs, this.topLayers);
                else
                    this.append(this.dialogs);
            }
            this.dialogs.append(dialog);
            this.contentBox.disable();
            for (var i = 0; i < this.dialogs.children.length - 1; i++)
                this.dialogs.children[i].disable();
        };
        App.prototype.removeDialog = function (dialog) {
            if (this.dialogs !== undefined) {
                this.dialogs.remove(dialog);
                if (this.dialogs.children.length === 0) {
                    this.remove(this.dialogs);
                    this.dialogs = undefined;
                    this.contentBox.enable();
                }
                else
                    this.dialogs.lastChild.enable();
            }
        };
        App.prototype.appendTopLayer = function (layer) {
            if (this.topLayers === undefined) {
                this.topLayers = new Ui.LBox();
                this.topLayers.eventsHidden = true;
                this.append(this.topLayers);
            }
            this.topLayers.append(layer);
        };
        App.prototype.removeTopLayer = function (layer) {
            if (this.topLayers !== undefined) {
                this.topLayers.remove(layer);
                if (this.topLayers.children.length === 0) {
                    this.remove(this.topLayers);
                    this.topLayers = undefined;
                }
            }
        };
        App.prototype.getArguments = function () {
            return this.arguments;
        };
        Object.defineProperty(App.prototype, "isReady", {
            get: function () {
                return this.ready;
            },
            enumerable: true,
            configurable: true
        });
        App.prototype.onReady = function () {
            if (this.loaded) {
                document.documentElement.style.position = 'absolute';
                document.documentElement.style.padding = '0px';
                document.documentElement.style.margin = '0px';
                document.documentElement.style.border = '0px solid black';
                document.documentElement.style.width = '100%';
                document.documentElement.style.height = '100%';
                document.body.style.position = 'absolute';
                document.body.style.overflow = 'hidden';
                document.body.style.padding = '0px';
                document.body.style.margin = '0px';
                document.body.style.border = '0px solid black';
                document.body.style.outline = 'none';
                document.body.style.width = '100%';
                document.body.style.height = '100%';
                document.body.appendChild(this.drawing);
                this.handleScrolling(document.body);
                if ((this.requireFonts !== undefined) && (this.testFontTask === undefined))
                    this.testRequireFonts();
                this.isLoaded = true;
                this.parentVisible = true;
                this.fireEvent('ready');
                this.ready = true;
                if ((this.updateTask === false) && this.ready) {
                    var app_1 = this;
                    this.updateTask = true;
                    requestAnimationFrame(function () { app_1.update(); });
                }
                new Ui.WheelManager(this);
                new Ui.PointerManager(this);
                new Ui.DragNativeManager(this);
            }
        };
        App.prototype.onWindowKeyUp = function (event) {
            var key = event.which;
            if ((key == 27) && (this.dialogs !== undefined) && (this.dialogs.children.length > 0)) {
                var dialog = this.dialogs.children[this.dialogs.children.length - 1];
                if ('close' in dialog)
                    dialog.close();
                else
                    dialog.hide();
                event.preventDefault();
                event.stopPropagation();
            }
        };
        App.prototype.onMessage = function (event) {
            if (parent === event.source) {
                event.preventDefault();
                event.stopPropagation();
                var msg = JSON.parse(event.data);
                this.fireEvent('parentmessage', msg);
            }
        };
        App.prototype.sendMessageToParent = function (msg) {
            parent.postMessage(msg.serialize(), "*");
        };
        App.prototype.findFocusableDiv = function (current) {
            if (('tabIndex' in current) && (current.tabIndex >= 0))
                return current;
            if ('childNodes' in current) {
                for (var i = 0; i < current.childNodes.length; i++) {
                    var res = this.findFocusableDiv(current.childNodes[i]);
                    if (res !== undefined)
                        return res;
                }
            }
            return undefined;
        };
        App.prototype.enqueueDraw = function (element) {
            element.drawNext = this.drawList;
            this.drawList = element;
            if ((this.updateTask === false) && this.ready) {
                this.updateTask = true;
                setTimeout(this.bindedUpdate, 0);
            }
        };
        App.prototype.enqueueLayout = function (element) {
            element.layoutNext = this.layoutList;
            this.layoutList = element;
            if ((this.updateTask === false) && this.ready) {
                this.updateTask = true;
                requestAnimationFrame(this.bindedUpdate);
            }
        };
        App.prototype.handleScrolling = function (drawing) {
            this.connect(this, 'ptrdown', function (event) {
                var startOffsetX = drawing.scrollLeft;
                var startOffsetY = drawing.scrollTop;
                var watcher = event.pointer.watch(this);
                this.connect(watcher, 'move', function () {
                    if (!watcher.getIsCaptured()) {
                        if (watcher.pointer.getIsMove()) {
                            var direction = watcher.getDirection();
                            var allowed = false;
                            if (direction === 'left')
                                allowed = (drawing.scrollLeft + drawing.clientWidth) < drawing.scrollWidth;
                            else if (direction === 'right')
                                allowed = drawing.scrollLeft > 0;
                            else if (direction === 'bottom')
                                allowed = drawing.scrollTop > 0;
                            else if (direction === 'top')
                                allowed = true;
                            if (allowed)
                                watcher.capture();
                            else
                                watcher.cancel();
                        }
                    }
                    else {
                        var delta = watcher.getDelta();
                        drawing.scrollLeft = startOffsetX - delta.x;
                        drawing.scrollTop = startOffsetY - delta.y;
                    }
                });
            });
        };
        App.prototype.getElementsByClassName = function (className) {
            var res = [];
            var reqSearch = function (current) {
                if (current.classType === className)
                    res.push(current);
                if (current.children !== undefined) {
                    for (var i = 0; i < current.children.length; i++)
                        reqSearch(current.children[i]);
                }
            };
            reqSearch(this);
            return res;
        };
        App.prototype.getElementByDrawing = function (drawing) {
            var reqSearch = function (current) {
                if (current.drawing === drawing)
                    return current;
                if (current.children !== undefined) {
                    for (var i = 0; i < current.children.length; i++) {
                        var res = reqSearch(current.children[i]);
                        if (res !== undefined)
                            return res;
                    }
                }
            };
            return reqSearch(this);
        };
        App.prototype.getInverseLayoutTransform = function () {
            return Ui.Matrix.createTranslate(-document.body.scrollLeft, -document.body.scrollTop).
                multiply(_super.prototype.getInverseLayoutTransform.call(this));
        };
        App.prototype.getLayoutTransform = function () {
            return _super.prototype.getLayoutTransform.call(this).translate(document.body.scrollLeft, document.body.scrollTop);
        };
        App.prototype.invalidateMeasure = function () {
            this.invalidateLayout();
        };
        App.prototype.invalidateArrange = function () {
            this.invalidateLayout();
        };
        App.prototype.arrangeCore = function (w, h) {
            if (Core.Navigator.Android && Core.Navigator.isWebkit) {
                if ((this.focusElement != undefined) && ((this.focusElement.tagName === 'INPUT') || (this.focusElement.tagName === 'TEXTAREA') || (this.focusElement.contenteditable))) {
                    if (h - 100 > this.lastArrangeHeight)
                        this.focusElement.blur();
                }
            }
            this.lastArrangeHeight = h;
            _super.prototype.arrangeCore.call(this, w, h);
        };
        App.getWindowIFrame = function (currentWindow) {
            if (currentWindow === undefined)
                currentWindow = window;
            var iframe;
            if (currentWindow.parent !== currentWindow) {
                try {
                    var frames_1 = currentWindow.parent.document.getElementsByTagName("IFRAME");
                    for (var i = 0; i < frames_1.length; i++) {
                        if (frames_1[i].contentWindow === currentWindow) {
                            iframe = frames_1[i];
                            break;
                        }
                    }
                }
                catch (e) { }
            }
            return iframe;
        };
        App.getRootWindow = function () {
            var rootWindow = window;
            while (rootWindow.parent != rootWindow)
                rootWindow = rootWindow.parent;
            return rootWindow;
        };
        App.current = undefined;
        return App;
    }(Ui.LBox));
    Ui.App = App;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Form = (function (_super) {
        __extends(Form, _super);
        function Form(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('submit');
            _this.connect(_this.drawing, 'submit', _this.onSubmit);
            if (init)
                _this.assign(init);
            return _this;
        }
        Form.prototype.onSubmit = function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.fireEvent('submit', this);
        };
        Form.prototype.submit = function () {
            this.drawing.submit();
        };
        Form.prototype.renderDrawing = function () {
            var drawing;
            drawing = document.createElement('form');
            var submit = document.createElement('input');
            submit.type = 'submit';
            submit.style.visibility = 'hidden';
            drawing.appendChild(submit);
            var container = document.createElement('div');
            this.containerDrawing = container;
            drawing.appendChild(container);
            return drawing;
        };
        return Form;
    }(Ui.LBox));
    Ui.Form = Form;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DialogCloseButton = (function (_super) {
        __extends(DialogCloseButton, _super);
        function DialogCloseButton(init) {
            var _this = _super.call(this) || this;
            _this.icon = 'backarrow';
            _this.text = 'Fermer';
            if (init)
                _this.assign(init);
            return _this;
        }
        DialogCloseButton.style = {
            showText: false,
            background: 'rgba(250,250,250,0)',
            backgroundBorder: 'rgba(250,250,250,0)',
            activeBackground: 'rgba(250,250,250,0)',
            activeBackgroundBorder: 'rgba(250,250,250,0)'
        };
        return DialogCloseButton;
    }(Ui.Button));
    Ui.DialogCloseButton = DialogCloseButton;
    var DialogGraphic = (function (_super) {
        __extends(DialogGraphic, _super);
        function DialogGraphic() {
            var _this = _super.call(this) || this;
            _this._background = undefined;
            _this._background = Ui.Color.create('#f8f8f8');
            return _this;
        }
        Object.defineProperty(DialogGraphic.prototype, "background", {
            set: function (color) {
                this._background = Ui.Color.create(color);
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        DialogGraphic.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            ctx.roundRectFilledShadow(0, 0, w, h, 2, 2, 2, 2, false, 3, new Ui.Color(0, 0, 0, 0.3));
            ctx.fillStyle = this._background.getCssRgba();
            ctx.fillRect(3, 3, w - 6, h - 6);
        };
        return DialogGraphic;
    }(Ui.CanvasElement));
    Ui.DialogGraphic = DialogGraphic;
    var DialogTitle = (function (_super) {
        __extends(DialogTitle, _super);
        function DialogTitle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DialogTitle.style = {
            color: '#666666',
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: 18,
            maxLine: 2
        };
        return DialogTitle;
    }(Ui.CompactLabel));
    Ui.DialogTitle = DialogTitle;
    var DialogButtonBox = (function (_super) {
        __extends(DialogButtonBox, _super);
        function DialogButtonBox() {
            var _this = _super.call(this) || this;
            _this.cancelButton = undefined;
            _this.addEvents('cancel');
            _this.bg = new Ui.Rectangle();
            _this.append(_this.bg);
            _this.actionBox = new Ui.HBox();
            _this.actionBox.margin = 5;
            _this.actionBox.spacing = 10;
            _this.append(_this.actionBox);
            _this.actionButtonsBox = new Ui.MenuToolBar();
            _this.actionButtonsBox.spacing = 5;
            _this.actionBox.append(_this.actionButtonsBox, true);
            _this.titleLabel = new DialogTitle();
            _this.titleLabel.width = 50;
            _this.titleLabel.verticalAlign = 'center';
            _this.actionButtonsBox.append(_this.titleLabel, true);
            return _this;
        }
        DialogButtonBox.prototype.getTitle = function () {
            return this.titleLabel.text;
        };
        DialogButtonBox.prototype.setTitle = function (title) {
            this.titleLabel.text = title;
        };
        DialogButtonBox.prototype.setCancelButton = function (button) {
            if (this.cancelButton !== undefined) {
                if (this.cancelButton instanceof Ui.Pressable)
                    this.disconnect(this.cancelButton, 'press', this.onCancelPress);
                this.actionBox.remove(this.cancelButton);
            }
            this.cancelButton = button;
            if (this.cancelButton !== undefined) {
                if (this.cancelButton instanceof Ui.Pressable)
                    this.connect(this.cancelButton, 'press', this.onCancelPress);
                this.actionBox.prepend(this.cancelButton);
            }
        };
        DialogButtonBox.prototype.setActionButtons = function (buttons) {
            this.actionButtonsBox.setContent(buttons);
            this.actionButtonsBox.prepend(this.titleLabel, true);
        };
        DialogButtonBox.prototype.getActionButtons = function () {
            var buttons = [];
            for (var i = 1; i < this.actionButtonsBox.getLogicalChildren().length; i++)
                buttons.push(this.actionButtonsBox.getLogicalChildren()[i]);
            return buttons;
        };
        DialogButtonBox.prototype.onCancelPress = function () {
            this.fireEvent('cancel', this);
        };
        DialogButtonBox.prototype.onStyleChange = function () {
            this.bg.fill = this.getStyleProperty('background');
        };
        DialogButtonBox.style = {
            background: '#e8e8e8'
        };
        return DialogButtonBox;
    }(Ui.LBox));
    Ui.DialogButtonBox = DialogButtonBox;
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(init) {
            var _this = _super.call(this) || this;
            _this.dialogSelection = undefined;
            _this.shadow = undefined;
            _this.shadowGraphic = undefined;
            _this.graphic = undefined;
            _this.lbox = undefined;
            _this.vbox = undefined;
            _this.contentBox = undefined;
            _this.contentVBox = undefined;
            _this._actionButtons = undefined;
            _this._cancelButton = undefined;
            _this.buttonsBox = undefined;
            _this.buttonsVisible = false;
            _this._preferredWidth = 100;
            _this._preferredHeight = 100;
            _this.actionBox = undefined;
            _this._autoClose = true;
            _this.openClock = undefined;
            _this.isClosed = true;
            _this.scroll = undefined;
            _this.addEvents('close');
            _this.dialogSelection = new Ui.Selection();
            _this.shadow = new Ui.Pressable();
            _this.shadow.focusable = false;
            _this.shadow.drawing.style.cursor = 'inherit';
            _this.appendChild(_this.shadow);
            _this.shadowGraphic = new Ui.Rectangle();
            _this.shadow.content = _this.shadowGraphic;
            _this.lbox = new Ui.Form();
            _this.connect(_this.lbox, 'submit', _this.onFormSubmit);
            _this.appendChild(_this.lbox);
            _this.graphic = new Ui.DialogGraphic();
            _this.lbox.append(_this.graphic);
            _this.vbox = new Ui.VBox();
            _this.vbox.margin = 3;
            _this.lbox.append(_this.vbox);
            _this.buttonsBox = new Ui.LBox();
            _this.buttonsBox.height = 32;
            _this.buttonsBox.hide(true);
            _this.vbox.append(_this.buttonsBox);
            _this.scroll = new Ui.ScrollingArea();
            _this.scroll.marginLeft = 2;
            _this.scroll.marginTop = 2;
            _this.scroll.marginRight = 2;
            _this.scroll.scrollHorizontal = false;
            _this.scroll.scrollVertical = false;
            _this.vbox.append(_this.scroll, true);
            _this.contentVBox = new Ui.VBox();
            _this.scroll.content = _this.contentVBox;
            _this.contentBox = new Ui.LBox();
            _this.contentBox.margin = 8;
            _this.contentVBox.append(_this.contentBox, true);
            _this.contextBox = new Ui.ContextBar();
            _this.contextBox.setSelection(_this.dialogSelection);
            _this.contextBox.hide();
            _this.buttonsBox.append(_this.contextBox);
            _this.actionBox = new Ui.DialogButtonBox();
            _this.connect(_this.actionBox, 'cancel', _this.close);
            _this.buttonsBox.append(_this.actionBox);
            _this.connect(_this.dialogSelection, 'change', _this.onDialogSelectionChange);
            _this.connect(_this.drawing, 'keydown', _this.onKeyDown);
            _this.connect(_this.shadow, 'press', _this.onShadowPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        Dialog.prototype.getSelectionHandler = function () {
            return this.dialogSelection;
        };
        Object.defineProperty(Dialog.prototype, "preferredWidth", {
            set: function (width) {
                this._preferredWidth = width;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dialog.prototype, "preferredHeight", {
            set: function (height) {
                this._preferredHeight = height;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Dialog.prototype.open = function () {
            if (this.isClosed) {
                Ui.App.current.appendDialog(this);
                this.isClosed = false;
                if (this.openClock == undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.onOpenTick(this.openClock, 0, 0);
                }
            }
        };
        Dialog.prototype.close = function () {
            if (!this.isClosed) {
                this.fireEvent('close', this);
                this.isClosed = true;
                this.lbox.disable();
                if (this.openClock === undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.openClock.begin();
                }
            }
        };
        Dialog.prototype.onOpenTick = function (clock, progress, delta) {
            var end = (progress >= 1);
            if (this.isClosed)
                progress = 1 - progress;
            this.shadow.opacity = progress;
            this.lbox.opacity = progress;
            this.lbox.transform = Ui.Matrix.createTranslate(0, -20 * (1 - progress));
            if (end) {
                this.openClock.stop();
                this.openClock = undefined;
                if (this.isClosed) {
                    Ui.App.current.removeDialog(this);
                    this.lbox.enable();
                }
            }
        };
        Dialog.prototype.getDefaultButton = function () {
            var buttons = this.actionBox.getActionButtons();
            var defaultButton;
            for (var i = 0; (defaultButton === undefined) && (i < buttons.length); i++)
                if (buttons[i] instanceof Ui.DefaultButton)
                    defaultButton = buttons[i];
            return defaultButton;
        };
        Dialog.prototype.defaultAction = function () {
            var defaultButton = this.getDefaultButton();
            if (defaultButton !== undefined)
                defaultButton.press();
        };
        Object.defineProperty(Dialog.prototype, "fullScrolling", {
            set: function (fullScrolling) {
                this.scroll.scrollHorizontal = fullScrolling;
                this.scroll.scrollVertical = fullScrolling;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dialog.prototype, "title", {
            get: function () {
                return this.actionBox.getTitle();
            },
            set: function (title) {
                this.actionBox.setTitle(title);
            },
            enumerable: true,
            configurable: true
        });
        Dialog.prototype.updateButtonsBoxVisible = function () {
            var visible = (this._cancelButton !== undefined) || (this._actionButtons !== undefined) ||
                (this.dialogSelection.getElements().length > 0);
            if (!this.buttonsVisible && visible) {
                this.buttonsVisible = true;
                this.buttonsBox.show();
            }
            else if (this.buttonsVisible && !visible) {
                this.buttonsVisible = false;
                this.buttonsBox.hide(true);
            }
        };
        Object.defineProperty(Dialog.prototype, "cancelButton", {
            set: function (button) {
                this._cancelButton = button;
                this.actionBox.setCancelButton(button);
                this.updateButtonsBoxVisible();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dialog.prototype, "actionButtons", {
            set: function (buttons) {
                this._actionButtons = buttons;
                this.actionBox.setActionButtons(buttons);
                this.updateButtonsBoxVisible();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dialog.prototype, "content", {
            get: function () {
                return this.contentBox.firstChild;
            },
            set: function (content) {
                this.contentBox.content = content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Dialog.prototype, "autoClose", {
            set: function (autoClose) {
                this._autoClose = autoClose;
            },
            enumerable: true,
            configurable: true
        });
        Dialog.prototype.onCancelPress = function () {
            this.close();
        };
        Dialog.prototype.onFormSubmit = function () {
            this.defaultAction();
        };
        Dialog.prototype.onDialogSelectionChange = function (selection) {
            if (selection.getElements().length === 0) {
                this.contextBox.hide();
                this.actionBox.show();
            }
            else {
                this.contextBox.show();
                this.actionBox.hide();
            }
            this.updateButtonsBoxVisible();
        };
        Dialog.prototype.onKeyDown = function (event) {
            if (event.which === 46) {
                if (this.dialogSelection.getElements().length !== 0) {
                    if (this.dialogSelection.executeDeleteAction()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        };
        Dialog.prototype.onShadowPress = function () {
            if (this._autoClose)
                this.close();
        };
        Dialog.prototype.onStyleChange = function () {
            this.shadowGraphic.fill = this.getStyleProperty('shadow');
            this.graphic.background = this.getStyleProperty('background');
        };
        Dialog.prototype.onChildInvalidateMeasure = function (child, type) {
            this.invalidateLayout();
        };
        Dialog.prototype.onChildInvalidateArrange = function (child) {
            this.invalidateLayout();
        };
        Dialog.prototype.measureCore = function (width, height) {
            this.shadow.measure(width, height);
            this.lbox.measure((width < this._preferredWidth) ? width : this._preferredWidth, (height < this._preferredHeight) ? height : this._preferredHeight);
            return { width: width, height: height };
        };
        Dialog.prototype.arrangeCore = function (width, height) {
            if ((this.openClock !== undefined) && !this.openClock.isActive)
                this.openClock.begin();
            this.shadow.arrange(0, 0, width, height);
            var usedWidth = Math.max((width < this._preferredWidth) ? width : this._preferredWidth, this.lbox.measureWidth);
            var usedHeight = Math.max((height < this._preferredHeight) ? height : this._preferredHeight, this.lbox.measureHeight);
            this.lbox.arrange((width - usedWidth) / 2, (height - usedHeight) / 2, usedWidth, usedHeight);
        };
        Dialog.style = {
            shadow: 'rgba(255,255,255,0.1)',
            background: '#f8f8f8'
        };
        return Dialog;
    }(Ui.Container));
    Ui.Dialog = Dialog;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Html = (function (_super) {
        __extends(Html, _super);
        function Html(init) {
            var _this = _super.call(this) || this;
            _this.bindedOnImageLoad = undefined;
            _this._fontSize = undefined;
            _this._fontFamily = undefined;
            _this._fontWeight = undefined;
            _this._color = undefined;
            _this._textAlign = undefined;
            _this._interLine = undefined;
            _this._wordWrap = undefined;
            _this._whiteSpace = undefined;
            _this.addEvents('link');
            _this.bindedOnImageLoad = _this.onImageLoad.bind(_this);
            _this.connect(_this.drawing, 'click', _this.onClick);
            _this.connect(_this.drawing, 'keypress', _this.onKeyPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        Html.prototype.getElements = function (tagName) {
            var res = [];
            this.searchElements(tagName.toUpperCase(), this.htmlDrawing, res);
            return res;
        };
        Html.prototype.searchElements = function (tagName, element, res) {
            for (var i = 0; i < element.childNodes.length; i++) {
                var child = element.childNodes[i];
                if (('tagName' in child) && (child.tagName.toUpperCase() == tagName))
                    res.push(child);
                this.searchElements(tagName, child, res);
            }
        };
        Html.prototype.getParentElement = function (tagName, element) {
            do {
                if (('tagName' in element) && (element.tagName.toUpperCase() == tagName))
                    return element;
                if (element.parentNode == undefined)
                    return undefined;
                if (element.parentNode === this.drawing)
                    return undefined;
                element = element.parentNode;
            } while (true);
        };
        Object.defineProperty(Html.prototype, "html", {
            get: function () {
                return this.htmlDrawing.innerHTML;
            },
            set: function (html) {
                this.htmlDrawing.innerHTML = html;
                var tab = this.getElements('IMG');
                for (var i = 0; i < tab.length; i++)
                    tab[i].onload = this.bindedOnImageLoad;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "text", {
            get: function () {
                if ('innerText' in this.htmlDrawing)
                    return this.htmlDrawing.innerText;
                else
                    return this.getTextContent(this.htmlDrawing);
            },
            set: function (text) {
                if ('innerText' in this.htmlDrawing)
                    this.htmlDrawing.innerText = text;
                else {
                    var div = document.createElement('div');
                    var content = void 0;
                    div.textContent = text;
                    content = div.textContent;
                    var lines = content.split('\n');
                    var content2 = '';
                    for (var i = 0; i < lines.length; i++) {
                        if (lines[i] !== '') {
                            if (content2 !== '')
                                content2 += "<br>";
                            content2 += lines[i];
                        }
                    }
                    this.html = content2;
                }
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Html.prototype.getTextContent = function (el) {
            var text = '';
            if (el.nodeType === 3)
                text += el.textContent;
            else if ((el.nodeType === 1) && ((el.nodeName == "BR") || (el.nodeName == "P")))
                text += '\n';
            if ('childNodes' in el) {
                for (var i = 0; i < el.childNodes.length; i++)
                    text += this.getTextContent(el.childNodes[i]);
            }
            return text;
        };
        Object.defineProperty(Html.prototype, "textAlign", {
            get: function () {
                if (this._textAlign !== undefined)
                    return this._textAlign;
                else
                    return this.getStyleProperty('textAlign');
            },
            set: function (textAlign) {
                if (this._textAlign !== textAlign) {
                    this._textAlign = textAlign;
                    this.drawing.style.textAlign = this.textAlign;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "fontSize", {
            get: function () {
                if (this._fontSize !== undefined)
                    return this._fontSize;
                else
                    return this.getStyleProperty('fontSize');
            },
            set: function (fontSize) {
                if (this._fontSize !== fontSize) {
                    this._fontSize = fontSize;
                    this.drawing.style.fontSize = this.fontSize + 'px';
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "fontFamily", {
            get: function () {
                if (this._fontFamily !== undefined)
                    return this._fontFamily;
                else
                    return this.getStyleProperty('fontFamily');
            },
            set: function (fontFamily) {
                if (this._fontFamily !== fontFamily) {
                    this._fontFamily = fontFamily;
                    this.drawing.style.fontFamily = this.fontFamily;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "fontWeight", {
            get: function () {
                if (this._fontWeight !== undefined)
                    return this._fontWeight;
                else
                    return this.getStyleProperty('fontWeight');
            },
            set: function (fontWeight) {
                if (this._fontWeight !== fontWeight) {
                    this._fontWeight = fontWeight;
                    this.drawing.style.fontWeight = this.fontWeight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "interLine", {
            get: function () {
                if (this._interLine !== undefined)
                    return this._interLine;
                else
                    return this.getStyleProperty('interLine');
            },
            set: function (interLine) {
                if (this._interLine !== interLine) {
                    this._interLine = interLine;
                    this.drawing.style.lineHeight = this.interLine;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "wordWrap", {
            get: function () {
                if (this._wordWrap !== undefined)
                    return this._wordWrap;
                else
                    return this.getStyleProperty('wordWrap');
            },
            set: function (wordWrap) {
                if (this._wordWrap !== wordWrap) {
                    this._wordWrap = wordWrap;
                    this.drawing.style.wordWrap = this.wordWrap;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Html.prototype, "whiteSpace", {
            get: function () {
                if (this._whiteSpace !== undefined)
                    return this._whiteSpace;
                else
                    return this.getStyleProperty('whiteSpace');
            },
            set: function (whiteSpace) {
                if (this._whiteSpace !== whiteSpace) {
                    this._whiteSpace = whiteSpace;
                    this.drawing.style.whiteSpace = this.whiteSpace;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Html.prototype.getColor = function () {
            if (this._color !== undefined)
                return this._color;
            else
                return Ui.Color.create(this.getStyleProperty('color'));
        };
        Object.defineProperty(Html.prototype, "color", {
            set: function (color) {
                if (this._color !== color) {
                    this._color = Ui.Color.create(color);
                    if (Core.Navigator.supportRgba)
                        this.drawing.style.color = this._color.getCssRgba();
                    else
                        this.drawing.style.color = this._color.getCssHtml();
                }
            },
            enumerable: true,
            configurable: true
        });
        Html.prototype.onSubtreeModified = function (event) {
            this.invalidateMeasure();
        };
        Html.prototype.onKeyPress = function (event) {
            this.invalidateMeasure();
        };
        Html.prototype.onImageLoad = function (event) {
            this.invalidateMeasure();
        };
        Html.prototype.onClick = function (event) {
            var target = this.getParentElement('A', event.target);
            if (target !== undefined) {
                event.preventDefault();
                event.stopPropagation();
                this.fireEvent('link', this, target.href);
            }
        };
        Html.prototype.onVisible = function () {
            this.invalidateMeasure();
        };
        Html.prototype.onStyleChange = function () {
            this.drawing.style.textAlign = this.textAlign;
            this.drawing.style.fontSize = this.fontSize + 'px';
            this.drawing.style.fontFamily = this.fontFamily;
            this.drawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                this.drawing.style.color = this.getColor().getCssRgba();
            else
                this.drawing.style.color = this.getColor().getCssHtml();
            this.drawing.style.lineHeight = this.interLine;
            this.drawing.style.wordWrap = this.wordWrap;
        };
        Html.prototype.renderDrawing = function () {
            var drawing = _super.prototype.renderDrawing.call(this);
            this.htmlDrawing = document.createElement('div');
            this.htmlDrawing.style.outline = 'none';
            this.htmlDrawing.style.padding = '0px';
            this.htmlDrawing.style.margin = '0px';
            this.htmlDrawing.style.display = 'inline-block';
            this.htmlDrawing.style.width = '';
            drawing.appendChild(this.htmlDrawing);
            return drawing;
        };
        Html.prototype.measureCore = function (width, height) {
            width = (this.width !== undefined) ? Math.max(width, this.width) : width;
            this.drawing.style.width = width + 'px';
            this.htmlDrawing.style.width = '';
            this.htmlDrawing.style.height = '';
            if (this.htmlDrawing.clientWidth > width) {
                this.htmlDrawing.style.width = width + 'px';
            }
            return {
                width: Math.max(this.htmlDrawing.clientWidth, this.htmlDrawing.scrollWidth),
                height: this.htmlDrawing.clientHeight
            };
        };
        Html.prototype.arrangeCore = function (width, height) {
            this.htmlDrawing.style.width = width + 'px';
            this.htmlDrawing.style.height = height + 'px';
        };
        Html.style = {
            color: 'black',
            fontSize: 16,
            fontFamily: 'Sans-serif',
            fontWeight: 'normal',
            textAlign: 'left',
            wordWrap: 'normal',
            whiteSpace: 'normal',
            interLine: 1
        };
        return Html;
    }(Ui.Element));
    Ui.Html = Html;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(init) {
            var _this = _super.call(this) || this;
            _this.drawing.style.whiteSpace = 'pre-wrap';
            _this.selectable = false;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Text.prototype, "textTransform", {
            set: function (textTransform) {
                this.drawing.style.textTransform = textTransform;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        return Text;
    }(Ui.Html));
    Ui.Text = Text;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Shadow = (function (_super) {
        __extends(Shadow, _super);
        function Shadow(init) {
            var _this = _super.call(this) || this;
            _this._radiusTopLeft = 0;
            _this._radiusTopRight = 0;
            _this._radiusBottomLeft = 0;
            _this._radiusBottomRight = 0;
            _this._shadowWidth = 4;
            _this._inner = false;
            _this._color = Ui.Color.create('black');
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Shadow.prototype, "color", {
            set: function (color) {
                if (this._color != color) {
                    this._color = Ui.Color.create(color);
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "inner", {
            get: function () {
                return this._inner;
            },
            set: function (inner) {
                if (this._inner != inner) {
                    this._inner = inner;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "shadowWidth", {
            get: function () {
                return this._shadowWidth;
            },
            set: function (shadowWidth) {
                if (this._shadowWidth != shadowWidth) {
                    this._shadowWidth = shadowWidth;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "radius", {
            set: function (radius) {
                this._radiusTopLeft = radius;
                this._radiusTopRight = radius;
                this._radiusBottomLeft = radius;
                this._radiusBottomRight = radius;
                this.invalidateDraw();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "radiusTopLeft", {
            get: function () {
                return this._radiusTopLeft;
            },
            set: function (radiusTopLeft) {
                if (this._radiusTopLeft != radiusTopLeft) {
                    this._radiusTopLeft = radiusTopLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "radiusTopRight", {
            get: function () {
                return this._radiusTopRight;
            },
            set: function (radiusTopRight) {
                if (this._radiusTopRight != radiusTopRight) {
                    this._radiusTopRight = radiusTopRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "radiusBottomLeft", {
            get: function () {
                return this._radiusBottomLeft;
            },
            set: function (radiusBottomLeft) {
                if (this._radiusBottomLeft != radiusBottomLeft) {
                    this._radiusBottomLeft = radiusBottomLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shadow.prototype, "radiusBottomRight", {
            get: function () {
                return this._radiusBottomRight;
            },
            set: function (radiusBottomRight) {
                if (this._radiusBottomRight != radiusBottomRight) {
                    this._radiusBottomRight = radiusBottomRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Shadow.prototype.updateCanvas = function (ctx) {
            var width = this.layoutWidth;
            var height = this.layoutHeight;
            for (var i = 0; i < this._shadowWidth; i++) {
                var rgba = this._color.getRgba();
                var opacity = void 0;
                if (this._inner) {
                    if (this._shadowWidth == 1)
                        opacity = 1;
                    else {
                        var x = (i + 1) / this._shadowWidth;
                        opacity = x * x;
                    }
                }
                else
                    opacity = (i + 1) / (this._shadowWidth + 1);
                var color = new Ui.Color(rgba.r, rgba.g, rgba.b, rgba.a * opacity);
                ctx.fillStyle = color.getCssRgba();
                if (this._inner) {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, width, height, this._radiusTopLeft, this._radiusTopRight, this._radiusBottomRight, this._radiusBottomLeft);
                    ctx.roundRect(this._shadowWidth - i, this._shadowWidth - i, width - ((this._shadowWidth - i) * 2), height - ((this._shadowWidth - i) * 2), this._radiusTopLeft, this._radiusTopRight, this._radiusBottomRight, this._radiusBottomLeft, true);
                    ctx.closePath();
                    ctx.fill();
                }
                else {
                    ctx.beginPath();
                    ctx.roundRect(i, i, width - i * 2, height - i * 2, this._radiusTopLeft, this._radiusTopRight, this._radiusBottomRight, this._radiusBottomLeft);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        };
        return Shadow;
    }(Ui.CanvasElement));
    Ui.Shadow = Shadow;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Toaster = (function (_super) {
        __extends(Toaster, _super);
        function Toaster() {
            var _this = _super.call(this) || this;
            _this.margin = 10;
            _this.eventsHidden = true;
            return _this;
        }
        Toaster.prototype.appendToast = function (toast) {
            toast.newToast = true;
            if (this.children.length === 0)
                Ui.App.current.appendTopLayer(this);
            this.appendChild(toast);
        };
        Toaster.prototype.removeToast = function (toast) {
            this.removeChild(toast);
            if (this.children.length === 0)
                Ui.App.current.removeTopLayer(this);
        };
        Toaster.prototype.onArrangeTick = function (clock, progress, delta) {
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (progress === 1) {
                    child.transform = undefined;
                    child.newToast = false;
                }
                else if (child.newToast !== true)
                    child.transform = (Ui.Matrix.createTranslate((child.lastLayoutX - child.layoutX) * (1 - progress), (child.lastLayoutY - child.layoutY) * (1 - progress)));
            }
            if (progress === 1)
                this.arrangeClock = undefined;
        };
        Toaster.prototype.measureCore = function (width, height) {
            var spacing = 10;
            var maxWidth = 0;
            var totalHeight = 0;
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var size = child.measure(0, 0);
                totalHeight += size.height;
                if (size.width > maxWidth)
                    maxWidth = size.width;
            }
            totalHeight += Math.max(0, this.children.length - 1) * spacing;
            return { width: maxWidth, height: totalHeight };
        };
        Toaster.prototype.arrangeCore = function (width, height) {
            var spacing = 10;
            var y = 0;
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                child.lastLayoutX = child.layoutX;
                child.lastLayoutY = child.layoutY;
                y += child.measureHeight;
                child.arrange(0, height - y, this.measureWidth, child.measureHeight);
                y += spacing;
            }
            if (this.arrangeClock === undefined) {
                this.arrangeClock = new Anim.Clock({ duration: 1, speed: 5 });
                this.connect(this.arrangeClock, 'timeupdate', this.onArrangeTick);
                this.arrangeClock.begin();
            }
        };
        Toaster.appendToast = function (toast) {
            Ui.Toaster.current.appendToast(toast);
        };
        Toaster.removeToast = function (toast) {
            Ui.Toaster.current.removeToast(toast);
        };
        return Toaster;
    }(Ui.Container));
    Ui.Toaster = Toaster;
    var Toast = (function (_super) {
        __extends(Toast, _super);
        function Toast() {
            var _this = _super.call(this) || this;
            _this._isClosed = true;
            _this.newToast = false;
            _this.addEvents('close');
            var sha = new Ui.Shadow();
            sha.shadowWidth = 2;
            sha.radius = 1;
            sha.inner = false;
            sha.opacity = 0.8;
            _this.append(sha);
            var r = new Ui.Rectangle();
            r.fill = '#666666';
            r.width = 200;
            r.height = 30;
            r.margin = 2;
            r.opacity = 0.5;
            _this.append(r);
            _this.toastContentBox = new Ui.LBox();
            _this.toastContentBox.margin = 2;
            _this.toastContentBox.width = 200;
            _this.append(_this.toastContentBox);
            return _this;
        }
        Object.defineProperty(Toast.prototype, "isClosed", {
            get: function () {
                return this._isClosed;
            },
            enumerable: true,
            configurable: true
        });
        Toast.prototype.open = function () {
            if (this._isClosed) {
                this._isClosed = false;
                if (this.openClock == undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.opacity = 0;
                }
                new Core.DelayedTask(this, 2, this.close);
                Ui.Toaster.appendToast(this);
            }
        };
        Toast.prototype.close = function () {
            if (!this._isClosed) {
                this._isClosed = true;
                this.disable();
                if (this.openClock == undefined) {
                    this.openClock = new Anim.Clock({
                        duration: 1, target: this, speed: 5,
                        ease: new Anim.PowerEase({ mode: 'out' })
                    });
                    this.connect(this.openClock, 'timeupdate', this.onOpenTick);
                    this.openClock.begin();
                }
            }
        };
        Toast.prototype.onOpenTick = function (clock, progress, delta) {
            var end = (progress >= 1);
            if (this._isClosed)
                progress = 1 - progress;
            this.opacity = progress;
            this.transform = Ui.Matrix.createTranslate(-20 * (1 - progress), 0);
            if (end) {
                this.openClock.stop();
                this.openClock = undefined;
                if (this._isClosed) {
                    this.enable();
                    this.fireEvent('close', this);
                    Ui.Toaster.removeToast(this);
                }
            }
        };
        Object.defineProperty(Toast.prototype, "content", {
            set: function (content) {
                this.toastContentBox.content = content;
            },
            enumerable: true,
            configurable: true
        });
        Toast.prototype.arrangeCore = function (width, height) {
            _super.prototype.arrangeCore.call(this, width, height);
            if ((this.openClock != undefined) && !this.openClock.isActive)
                this.openClock.begin();
        };
        Toast.send = function (content) {
            var toast = new Ui.Toast();
            if (typeof (content) === 'string') {
                var t = new Ui.Text();
                t.text = content;
                t.verticalAlign = 'center';
                t.margin = 5;
                t.color = Ui.Color.create('#deff89');
                content = t;
            }
            toast.content = content;
            toast.open();
        };
        return Toast;
    }(Ui.LBox));
    Ui.Toast = Toast;
})(Ui || (Ui = {}));
Ui.Toaster.current = new Ui.Toaster();
var Ui;
(function (Ui) {
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image(init) {
            var _this = _super.call(this) || this;
            _this._src = undefined;
            _this.loaddone = false;
            _this._naturalWidth = undefined;
            _this._naturalHeight = undefined;
            _this.setSrcLock = false;
            _this.addEvents('ready', 'error');
            _this.connect(_this.imageDrawing, 'contextmenu', function (event) { return event.preventDefault(); });
            _this.connect(_this.imageDrawing, 'load', _this.onImageLoad);
            _this.connect(_this.imageDrawing, 'error', _this.onImageError);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Image.prototype, "src", {
            get: function () {
                return this._src;
            },
            set: function (src) {
                if (src === undefined)
                    throw ('Image src cant be undefined');
                this.setSrcLock = true;
                this.loaddone = false;
                this._naturalWidth = undefined;
                this._naturalHeight = undefined;
                this._src = src;
                this.imageDrawing.setAttribute('src', src);
                if ((this.imageDrawing.complete === true) && !this.loaddone) {
                    this.loaddone = true;
                    this._naturalWidth = this.imageDrawing.naturalWidth;
                    this._naturalHeight = this.imageDrawing.naturalHeight;
                    this.fireEvent('ready', this);
                    this.invalidateMeasure();
                }
                this.setSrcLock = false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "naturalWidth", {
            get: function () {
                return this._naturalWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "naturalHeight", {
            get: function () {
                return this._naturalHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "isReady", {
            get: function () {
                return this.loaddone;
            },
            enumerable: true,
            configurable: true
        });
        Image.prototype.onImageError = function (event) {
            this.fireEvent('error', this);
        };
        Image.prototype.onImageLoad = function (event) {
            if ((event.target != undefined) && (event.target.naturalWidth != undefined) && (event.target.naturalHeight != undefined)) {
                this.loaddone = true;
                this._naturalWidth = event.target.naturalWidth;
                this._naturalHeight = event.target.naturalHeight;
                this.fireEvent('ready', this);
                this.invalidateMeasure();
            }
            else {
                if (this.setSrcLock)
                    new Core.DelayedTask(this, 0, this.onImageDelayReady);
                else
                    this.onImageDelayReady();
            }
        };
        Image.prototype.onAppReady = function () {
            this.disconnect(Ui.App.current, 'ready', this.onAppReady);
            this.onImageDelayReady();
        };
        Image.prototype.onImageDelayReady = function () {
            if (!Ui.App.current.isReady)
                this.connect(Ui.App.current, 'ready', this.onAppReady);
            else {
                this.loaddone = true;
                if (document.body == undefined) {
                    var body = document.createElement('body');
                    document.body = body;
                }
                var imgClone = document.createElement('img');
                imgClone.setAttribute('src', this._src);
                document.body.appendChild(imgClone);
                this._naturalWidth = imgClone.width;
                this._naturalHeight = imgClone.height;
                document.body.removeChild(imgClone);
                this.fireEvent('ready', this);
                this.invalidateMeasure();
            }
        };
        Image.prototype.renderDrawing = function () {
            this.imageDrawing = document.createElement('img');
            this.imageDrawing.style.position = 'absolute';
            this.imageDrawing.style.top = '0px';
            this.imageDrawing.style.left = '0px';
            this.imageDrawing.style.width = '0px';
            this.imageDrawing.style.height = '0px';
            this.imageDrawing.style.pointerEvents = 'none';
            this.imageDrawing.setAttribute('draggable', 'false');
            if (Core.Navigator.isWebkit) {
                this.imageDrawing.style.webkitUserSelect = 'none';
                this.imageDrawing.style['webkitTouchCallout'] = 'none';
            }
            else if (Core.Navigator.isGecko)
                this.imageDrawing.style['MozUserSelect'] = 'none';
            else if (Core.Navigator.isIE)
                this.connect(this.imageDrawing, 'selectstart', function (event) { event.preventDefault(); });
            return this.imageDrawing;
        };
        Image.prototype.measureCore = function (width, height) {
            if (!this.loaddone)
                return { width: 0, height: 0 };
            var size;
            if (this.width === undefined) {
                if (this.height === undefined)
                    size = { width: this._naturalWidth, height: this._naturalHeight };
                else {
                    var fixedHeight = this.height - (this.marginTop + this.marginBottom);
                    size = { width: (this._naturalWidth * fixedHeight) / this._naturalHeight, height: fixedHeight };
                }
            }
            else {
                if (this.height === undefined) {
                    var fixedWidth = this.width - (this.marginLeft + this.marginRight);
                    size = { width: fixedWidth, height: (this._naturalHeight * fixedWidth) / this._naturalWidth };
                }
                else
                    size = { width: 0, height: 0 };
            }
            return size;
        };
        Image.prototype.arrangeCore = function (width, height) {
            if (this.imageDrawing !== undefined) {
                this.imageDrawing.style.width = width + 'px';
                this.imageDrawing.style.height = height + 'px';
            }
        };
        return Image;
    }(Ui.Element));
    Ui.Image = Image;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Loading = (function (_super) {
        __extends(Loading, _super);
        function Loading(init) {
            var _this = _super.call(this) || this;
            _this.clock = undefined;
            _this.ease = undefined;
            _this.ease = new Anim.PowerEase({ mode: 'inout' });
            _this.clock = new Anim.Clock({ repeat: 'forever', duration: 2 });
            _this.connect(_this.clock, 'timeupdate', _this.invalidateDraw);
            if (init)
                _this.assign(init);
            return _this;
        }
        Loading.prototype.onVisible = function () {
            _super.prototype.onVisible.call(this);
            this.clock.begin();
        };
        Loading.prototype.onHidden = function () {
            _super.prototype.onHidden.call(this);
            this.clock.stop();
        };
        Loading.prototype.updateCanvas = function (ctx) {
            var p = this.clock.progress;
            if (p === undefined)
                p = 0;
            var p2 = (p > 0.8) ? (1 - ((p - 0.8) * 5)) : (p / 0.8);
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var x = w / 2;
            var y = h / 2;
            var lineWidth = Math.max(2, Math.min(5, Math.min(w, h) * 5 / 60));
            var radius = ((Math.min(w, h) - lineWidth) / 2) - 5;
            var startAngle = Math.PI * 2 * p;
            if (p > 0.8)
                startAngle = Math.PI * 2 * p - (Math.PI * 2 * 5 * this.ease.ease(p2) / 6);
            var endAngle = startAngle + (Math.PI / 4) + (Math.PI * 2 * 5 * this.ease.ease(p2) / 6);
            ctx.strokeStyle = this.getStyleProperty('color').getCssRgba();
            ctx.beginPath();
            ctx.arc(x, y, radius, startAngle, endAngle, false);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        };
        Loading.prototype.measureCore = function (width, height) {
            return { width: 30, height: 30 };
        };
        Loading.style = {
            color: new Ui.Color(0.27, 0.52, 0.9)
        };
        return Loading;
    }(Ui.CanvasElement));
    Ui.Loading = Loading;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Entry = (function (_super) {
        __extends(Entry, _super);
        function Entry(init) {
            var _this = _super.call(this) || this;
            _this._fontSize = undefined;
            _this._fontFamily = undefined;
            _this._fontWeight = undefined;
            _this._color = undefined;
            _this._value = '';
            _this._passwordMode = false;
            _this.addEvents('change', 'validate');
            _this.selectable = true;
            _this.focusable = true;
            _this.connect(_this.drawing, 'change', _this.onChange);
            _this.connect(_this.drawing, 'paste', _this.onPaste);
            _this.connect(_this.drawing, 'keyup', _this.onKeyUp);
            _this.connect(_this.drawing, 'keydown', _this.onKeyDown);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Entry.prototype, "passwordMode", {
            set: function (passwordMode) {
                if (this._passwordMode != passwordMode) {
                    this._passwordMode = passwordMode;
                    if (this._passwordMode)
                        this.drawing.setAttribute('type', 'password');
                    else
                        this.drawing.setAttribute('type', 'text');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Entry.prototype, "fontSize", {
            get: function () {
                if (this._fontSize != undefined)
                    return this._fontSize;
                else
                    return this.getStyleProperty('fontSize');
            },
            set: function (fontSize) {
                if (this._fontSize != fontSize) {
                    this._fontSize = fontSize;
                    this.drawing.style.fontSize = this.fontSize + 'px';
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Entry.prototype, "fontFamily", {
            get: function () {
                if (this._fontFamily != undefined)
                    return this._fontFamily;
                else
                    return this.getStyleProperty('fontFamily');
            },
            set: function (fontFamily) {
                if (this._fontFamily != fontFamily) {
                    this._fontFamily = fontFamily;
                    this.drawing.style.fontFamily = this.fontFamily;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Entry.prototype, "fontWeight", {
            get: function () {
                if (this._fontWeight != undefined)
                    return this._fontWeight;
                else
                    return this.getStyleProperty('fontWeight');
            },
            set: function (fontWeight) {
                if (this._fontWeight != fontWeight) {
                    this._fontWeight = fontWeight;
                    this.drawing.style.fontWeight = this.fontWeight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Entry.prototype.getColor = function () {
            if (this._color != undefined)
                return this._color;
            else
                return Ui.Color.create(this.getStyleProperty('color'));
        };
        Object.defineProperty(Entry.prototype, "color", {
            set: function (color) {
                if (this._color != color) {
                    this._color = Ui.Color.create(color);
                    if (Core.Navigator.supportRgba)
                        this.drawing.style.color = this.getColor().getCssRgba();
                    else
                        this.drawing.style.color = this.getColor().getCssHtml();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Entry.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (value == undefined)
                    value = '';
                this._value = value;
                this.drawing.value = this._value;
            },
            enumerable: true,
            configurable: true
        });
        Entry.prototype.onPaste = function (event) {
            event.stopPropagation();
            new Core.DelayedTask(this, 0, this.onAfterPaste);
        };
        Entry.prototype.onAfterPaste = function () {
            if (this.drawing.value != this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
            }
        };
        Entry.prototype.onChange = function (event) {
            if (this.drawing.value != this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
            }
        };
        Entry.prototype.onKeyDown = function (event) {
            var key = event.which;
            if ((key == 37) || (key == 39) || (key == 46) || (key == 8))
                event.stopPropagation();
        };
        Entry.prototype.onKeyUp = function (event) {
            var key = event.which;
            if ((key == 37) || (key == 39) || (key == 46) || (key == 8))
                event.stopPropagation();
            if (this.drawing.value !== this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
            }
        };
        Entry.prototype.renderDrawing = function () {
            var drawing = document.createElement('input');
            drawing.setAttribute('type', 'text');
            drawing.style.opacity = '1';
            drawing.style.border = '0px';
            drawing.style.margin = '0px';
            drawing.style.padding = '0px';
            drawing.style.outline = 'none';
            if (Core.Navigator.isIE)
                drawing.style.backgroundColor = 'rgba(255,255,255,0.01)';
            else
                drawing.style.background = 'none';
            if (Core.Navigator.isWebkit)
                drawing.style.webkitAppearance = 'none';
            drawing.style.fontSize = this.fontSize + 'px';
            drawing.style.fontFamily = this.fontFamily;
            drawing.style.fontWeight = this.fontWeight;
            drawing.style.color = this.getColor().getCssRgba();
            return drawing;
        };
        Entry.prototype.measureCore = function (width, height) {
            return { width: 8, height: (this.fontSize * 3 / 2) };
        };
        Entry.prototype.arrangeCore = function (width, height) {
            this.drawing.style.width = width + 'px';
            this.drawing.style.height = height + 'px';
            this.drawing.style.lineHeight = height + 'px';
        };
        Entry.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.drawing.blur();
            this.drawing.style.cursor = 'default';
            this.drawing.disabled = true;
        };
        Entry.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.drawing.style.cursor = 'auto';
            this.drawing.disabled = false;
        };
        Entry.prototype.onStyleChange = function () {
            this.drawing.style.fontSize = this.fontSize + 'px';
            this.drawing.style.fontFamily = this.fontFamily;
            this.drawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                this.drawing.style.color = this.getColor().getCssRgba();
            else
                this.drawing.style.color = this.getColor().getCssHtml();
            this.invalidateMeasure();
        };
        Entry.style = {
            color: new Ui.Color(0, 0, 0),
            fontSize: 14,
            fontFamily: 'Sans-serif',
            fontWeight: 'normal'
        };
        return Entry;
    }(Ui.Element));
    Ui.Entry = Entry;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Fixed = (function (_super) {
        __extends(Fixed, _super);
        function Fixed() {
            var _this = _super.call(this) || this;
            _this.addEvents('resize');
            return _this;
        }
        Fixed.prototype.setPosition = function (item, x, y) {
            if (x !== undefined)
                item['Ui.Fixed.x'] = x;
            if (y !== undefined)
                item['Ui.Fixed.y'] = y;
            this.updateItemTransform(item);
        };
        Fixed.prototype.setRelativePosition = function (item, x, y, absolute) {
            if (absolute === void 0) { absolute = false; }
            if (x !== undefined)
                item['Ui.Fixed.relativeX'] = x;
            if (y !== undefined)
                item['Ui.Fixed.relativeY'] = y;
            item['Ui.Fixed.relativeAbsolute'] = absolute === true;
            this.updateItemTransform(item);
        };
        Fixed.prototype.append = function (child, x, y) {
            child['Ui.Fixed.x'] = x;
            child['Ui.Fixed.y'] = y;
            this.appendChild(child);
        };
        Fixed.prototype.remove = function (child) {
            delete (child['Ui.Fixed.x']);
            delete (child['Ui.Fixed.y']);
            delete (child['Ui.Fixed.relativeX']);
            delete (child['Ui.Fixed.relativeY']);
            delete (child['Ui.Fixed.relativeAbsolute']);
            this.removeChild(child);
        };
        Fixed.prototype.updateItemTransform = function (child) {
            var x = 0;
            if (child['Ui.Fixed.x'] !== undefined)
                x = child['Ui.Fixed.x'];
            if (child['Ui.Fixed.relativeX'] !== undefined)
                x -= child['Ui.Fixed.relativeX'] * ((child['Ui.Fixed.relativeAbsolute'] === true) ? 1 : child.measureWidth);
            var y = 0;
            if (child['Ui.Fixed.y'] !== undefined)
                y = child['Ui.Fixed.y'];
            if (child['Ui.Fixed.relativeY'] !== undefined)
                y -= child['Ui.Fixed.relativeY'] * ((child['Ui.Fixed.relativeAbsolute'] === true) ? 1 : child.measureHeight);
            child.transform = Ui.Matrix.createTranslate(x, y);
        };
        Fixed.prototype.measureCore = function (width, height) {
            for (var i = 0; i < this.children.length; i++)
                this.children[i].measure(width, height);
            return { width: 0, height: 0 };
        };
        Fixed.prototype.arrangeCore = function (width, height) {
            this.fireEvent('resize', this, width, height);
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                child.arrange(0, 0, child.measureWidth, child.measureHeight);
                this.updateItemTransform(child);
            }
        };
        Fixed.prototype.onChildInvalidateMeasure = function (child, event) {
            if (event !== 'remove') {
                child.measure(this.layoutWidth, this.layoutHeight);
                child.arrange(0, 0, child.measureWidth, child.measureHeight);
                this.updateItemTransform(child);
            }
        };
        Fixed.prototype.onChildInvalidateArrange = function (child) {
            child.arrange(0, 0, child.measureWidth, child.measureHeight);
            this.updateItemTransform(child);
        };
        return Fixed;
    }(Ui.Container));
    Ui.Fixed = Fixed;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ToolBar = (function (_super) {
        __extends(ToolBar, _super);
        function ToolBar(init) {
            var _this = _super.call(this) || this;
            _this.verticalAlign = 'center';
            _this.scrollVertical = false;
            _this.hbox = new Ui.HBox();
            _this.hbox.eventsHidden = true;
            _super.prototype.setContent.call(_this, _this.hbox);
            if (init)
                _this.assign(init);
            return _this;
        }
        ToolBar.prototype.append = function (child, resizable) {
            if (resizable === void 0) { resizable = false; }
            this.hbox.append(child, resizable);
        };
        ToolBar.prototype.remove = function (child) {
            this.hbox.remove(child);
        };
        Object.defineProperty(ToolBar.prototype, "content", {
            set: function (content) {
                this.hbox.content = content;
            },
            enumerable: true,
            configurable: true
        });
        ToolBar.prototype.onStyleChange = function () {
            var spacing = this.getStyleProperty('spacing');
            this.hbox.margin = spacing;
            this.hbox.spacing = spacing;
        };
        ToolBar.style = {
            spacing: 3
        };
        return ToolBar;
    }(Ui.ScrollingArea));
    Ui.ToolBar = ToolBar;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var TextBgGraphic = (function (_super) {
        __extends(TextBgGraphic, _super);
        function TextBgGraphic() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.textHasFocus = false;
            return _this;
        }
        Object.defineProperty(TextBgGraphic.prototype, "hasFocus", {
            set: function (hasFocus) {
                if (this.textHasFocus !== hasFocus) {
                    this.textHasFocus = hasFocus;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextBgGraphic.prototype, "background", {
            get: function () {
                var color;
                if (this.textHasFocus)
                    color = Ui.Color.create(this.getStyleProperty('focusBackground'));
                else
                    color = Ui.Color.create(this.getStyleProperty('background'));
                return color;
            },
            enumerable: true,
            configurable: true
        });
        TextBgGraphic.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var radius = this.getStyleProperty('radius');
            radius = Math.max(0, Math.min(radius, Math.min(w / 2, h / 2)));
            var borderWidth = this.getStyleProperty('borderWidth');
            var lh = Math.max(8, h - 4 - 16);
            if (this.isDisabled)
                ctx.globalAlpha = 0.2;
            ctx.fillStyle = this.background.getCssRgba();
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, radius, radius, radius, radius);
            ctx.closePath();
            ctx.fill();
        };
        TextBgGraphic.prototype.onDisable = function () {
            this.invalidateDraw();
        };
        TextBgGraphic.prototype.onEnable = function () {
            this.invalidateDraw();
        };
        TextBgGraphic.prototype.onStyleChange = function () {
            this.invalidateDraw();
        };
        TextBgGraphic.style = {
            radius: 3,
            borderWidth: 2,
            background: Ui.Color.create('rgba(120,120,120,0.2)'),
            focusBackground: Ui.Color.create('rgba(33,211,255,0.4)')
        };
        return TextBgGraphic;
    }(Ui.CanvasElement));
    Ui.TextBgGraphic = TextBgGraphic;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var TextField = (function (_super) {
        __extends(TextField, _super);
        function TextField(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('change');
            _this.padding = 3;
            _this.graphic = new Ui.TextBgGraphic();
            _this.append(_this.graphic);
            _this.textholder = new Ui.Label();
            _this.textholder.opacity = 0.5;
            _this.textholder.horizontalAlign = 'center';
            _this.textholder.margin = 3;
            _this.append(_this.textholder);
            _this.entry = new Ui.Entry();
            _this.entry.margin = 4;
            _this.entry.fontSize = 16;
            _this.connect(_this.entry, 'focus', _this.onEntryFocus);
            _this.connect(_this.entry, 'blur', _this.onEntryBlur);
            _this.append(_this.entry);
            _this.connect(_this.entry, 'change', _this.onEntryChange);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(TextField.prototype, "textHolder", {
            set: function (text) {
                this.textholder.text = text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "passwordMode", {
            set: function (passwordMode) {
                this.entry.passwordMode = passwordMode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextField.prototype, "value", {
            get: function () {
                return this.entry.value;
            },
            set: function (value) {
                this.entry.value = value;
                if ((value === undefined) || (value === ''))
                    this.textholder.show();
                else
                    this.textholder.hide();
            },
            enumerable: true,
            configurable: true
        });
        TextField.prototype.onEntryFocus = function () {
            this.textholder.hide();
            this.graphic.hasFocus = true;
        };
        TextField.prototype.onEntryBlur = function () {
            if (this.value === '')
                this.textholder.show();
            this.graphic.hasFocus = false;
        };
        TextField.prototype.onEntryChange = function (entry, value) {
            this.fireEvent('change', this, value);
        };
        return TextField;
    }(Ui.LBox));
    Ui.TextField = TextField;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var CheckBoxGraphic = (function (_super) {
        __extends(CheckBoxGraphic, _super);
        function CheckBoxGraphic() {
            var _this = _super.call(this) || this;
            _this.isDown = false;
            _this.isChecked = false;
            _this.color = undefined;
            _this.checkColor = undefined;
            _this.activeColor = undefined;
            _this.borderWidth = 2;
            _this.radius = 3;
            _this.color = new Ui.Color(1, 1, 1);
            _this.activeColor = new Ui.Color(0.31, 0.66, 0.31);
            _this.checkColor = new Ui.Color(1, 1, 1);
            return _this;
        }
        CheckBoxGraphic.prototype.getIsDown = function () {
            return this.isDown;
        };
        CheckBoxGraphic.prototype.setIsDown = function (isDown) {
            if (this.isDown != isDown) {
                this.isDown = isDown;
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.getIsChecked = function () {
            return this.isChecked;
        };
        CheckBoxGraphic.prototype.setIsChecked = function (isChecked) {
            if (this.isChecked != isChecked) {
                this.isChecked = isChecked;
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.setRadius = function (radius) {
            if (this.radius !== radius) {
                this.radius = radius;
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.getColor = function () {
            return this.color;
        };
        CheckBoxGraphic.prototype.setColor = function (color) {
            if (this.color !== color) {
                this.color = Ui.Color.create(color);
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.setBorderWidth = function (borderWidth) {
            if (this.borderWidth !== borderWidth) {
                this.borderWidth = borderWidth;
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.setCheckColor = function (color) {
            if (this.checkColor !== color) {
                this.checkColor = Ui.Color.create(color);
                this.invalidateDraw();
            }
        };
        CheckBoxGraphic.prototype.getCheckColor = function () {
            var deltaY = 0;
            if (this.getIsDown())
                deltaY = 0.20;
            var yuv = this.checkColor.getYuv();
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v);
        };
        CheckBoxGraphic.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var cx = w / 2;
            var cy = h / 2;
            var radius = Math.min(this.radius, 10);
            if (this.getIsDown())
                ctx.globalAlpha = 0.8;
            if (this.isDisabled)
                ctx.globalAlpha = 0.4;
            if (!this.isChecked) {
                ctx.strokeStyle = this.getColor().getCssRgba();
                ctx.lineWidth = this.borderWidth;
                ctx.beginPath();
                ctx.roundRect(cx - 10 + this.borderWidth / 2, cy - 10 + this.borderWidth / 2, 20 - this.borderWidth, 20 - this.borderWidth, radius, radius, radius, radius);
                ctx.closePath();
                ctx.stroke();
            }
            else {
                ctx.fillStyle = this.getColor().getCssRgba();
                ctx.beginPath();
                ctx.roundRect(cx - 10, cy - 10, 20, 20, radius, radius, radius, radius);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;
                var iconSize = 20;
                var path = Ui.Icon.getPath('check');
                var scale = iconSize / 48;
                ctx.save();
                ctx.translate((w - iconSize) / 2, (h - iconSize) / 2);
                ctx.scale(scale, scale);
                ctx.fillStyle = this.getCheckColor().getCssRgba();
                ctx.beginPath();
                ctx.svgPath(path);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        };
        CheckBoxGraphic.prototype.measureCore = function (width, height) {
            return { width: 30, height: 30 };
        };
        CheckBoxGraphic.prototype.onDisable = function () {
            this.invalidateDraw();
        };
        CheckBoxGraphic.prototype.onEnable = function () {
            this.invalidateDraw();
        };
        return CheckBoxGraphic;
    }(Ui.CanvasElement));
    Ui.CheckBoxGraphic = CheckBoxGraphic;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var CheckBox = (function (_super) {
        __extends(CheckBox, _super);
        function CheckBox(init) {
            var _this = _super.call(this) || this;
            _this.contentBox = undefined;
            _this._content = undefined;
            _this._text = undefined;
            _this._isToggled = false;
            _this.addEvents('change', 'toggle', 'untoggle');
            _this.role = 'checkbox';
            _this.drawing.setAttribute('aria-checked', 'false');
            _this.padding = 3;
            _this.hbox = new Ui.HBox();
            _this.append(_this.hbox);
            _this.graphic = new Ui.CheckBoxGraphic();
            _this.hbox.append(_this.graphic);
            _this.connect(_this, 'down', _this.onCheckBoxDown);
            _this.connect(_this, 'up', _this.onCheckBoxUp);
            _this.connect(_this, 'focus', _this.onCheckFocus);
            _this.connect(_this, 'blur', _this.onCheckBlur);
            _this.connect(_this, 'press', _this.onCheckPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(CheckBox.prototype, "isToggled", {
            get: function () {
                return this._isToggled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CheckBox.prototype, "value", {
            get: function () {
                return this.isToggled;
            },
            set: function (value) {
                if (value)
                    this.toggle();
                else
                    this.untoggle();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CheckBox.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                if (text === undefined) {
                    if (this.contentBox !== undefined) {
                        this.hbox.remove(this.contentBox);
                        this.contentBox = undefined;
                    }
                    this._text = undefined;
                    this._content = undefined;
                }
                else {
                    if (this._text !== undefined) {
                        this._text = text;
                        this.contentBox.text = this._text;
                    }
                    else {
                        if (this._content !== undefined) {
                            this.hbox.remove(this.contentBox);
                            this._content = undefined;
                        }
                        this._text = text;
                        var t = new Ui.Text();
                        t.margin = 8;
                        t.text = this._text;
                        t.verticalAlign = 'center';
                        this.contentBox = t;
                        this.hbox.append(this.contentBox, true);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CheckBox.prototype, "content", {
            get: function () {
                return this._content;
            },
            set: function (content) {
                if (content === undefined) {
                    if (this.contentBox !== undefined) {
                        this.hbox.remove(this.contentBox);
                        this.contentBox = undefined;
                    }
                    this._text = undefined;
                    this._content = undefined;
                }
                else {
                    if (this._text !== undefined) {
                        this.hbox.remove(this.contentBox);
                        this._text = undefined;
                    }
                    if (this._content !== undefined)
                        this.contentBox.remove(this._content);
                    else {
                        var lb = new Ui.LBox();
                        lb.padding = 8;
                        lb.verticalAlign = 'center';
                        this.contentBox = lb;
                        this.hbox.append(this.contentBox);
                    }
                    this._content = content;
                    this.contentBox.append(this._content);
                }
            },
            enumerable: true,
            configurable: true
        });
        CheckBox.prototype.toggle = function () {
            this.onToggle();
        };
        CheckBox.prototype.untoggle = function () {
            this.onUntoggle();
        };
        CheckBox.prototype.onCheckPress = function () {
            if (!this._isToggled)
                this.onToggle();
            else
                this.onUntoggle();
        };
        CheckBox.prototype.onToggle = function () {
            if (!this._isToggled) {
                this._isToggled = true;
                this.drawing.setAttribute('aria-checked', 'true');
                this.fireEvent('toggle', this);
                this.graphic.setIsChecked(true);
                this.graphic.setColor(this.getStyleProperty('activeColor'));
                this.fireEvent('change', this, true);
            }
        };
        CheckBox.prototype.onUntoggle = function () {
            if (this._isToggled) {
                this._isToggled = false;
                this.drawing.setAttribute('aria-checked', 'false');
                this.fireEvent('untoggle', this);
                this.graphic.setIsChecked(false);
                this.graphic.setColor(this.getStyleProperty('color'));
                this.fireEvent('change', this, false);
            }
        };
        CheckBox.prototype.onCheckFocus = function () {
            if (!this.getIsMouseFocus())
                this.graphic.setColor(this.getStyleProperty('focusColor'));
        };
        CheckBox.prototype.onCheckBlur = function () {
            if (this._isToggled)
                this.graphic.setColor(this.getStyleProperty('activeColor'));
            else
                this.graphic.setColor(this.getStyleProperty('color'));
        };
        CheckBox.prototype.onCheckBoxDown = function () {
            this.graphic.setIsDown(true);
        };
        CheckBox.prototype.onCheckBoxUp = function () {
            this.graphic.setIsDown(false);
        };
        CheckBox.prototype.onStyleChange = function () {
            if (this.hasFocus)
                this.graphic.setColor(this.getStyleProperty('focusColor'));
            else {
                if (this._isToggled)
                    this.graphic.setColor(this.getStyleProperty('activeColor'));
                else
                    this.graphic.setColor(this.getStyleProperty('color'));
            }
            this.graphic.setCheckColor(this.getStyleProperty('checkColor'));
            this.graphic.setBorderWidth(this.getStyleProperty('borderWidth'));
            this.graphic.setRadius(this.getStyleProperty('radius'));
        };
        CheckBox.style = {
            borderWidth: 2,
            color: '#444444',
            activeColor: '#07a0e5',
            focusColor: '#21d3ff',
            checkColor: '#ffffff',
            radius: 3
        };
        return CheckBox;
    }(Ui.Pressable));
    Ui.CheckBox = CheckBox;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Frame = (function (_super) {
        __extends(Frame, _super);
        function Frame(init) {
            var _this = _super.call(this) || this;
            _this._fill = new Ui.Color();
            _this._radiusTopLeft = 0;
            _this._radiusTopRight = 0;
            _this._radiusBottomLeft = 0;
            _this._radiusBottomRight = 0;
            _this._frameWidth = 10;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Frame.prototype, "frameWidth", {
            get: function () {
                return this._frameWidth;
            },
            set: function (frameWidth) {
                if (frameWidth != this._frameWidth) {
                    this._frameWidth = frameWidth;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "fill", {
            set: function (fill) {
                if (this._fill != fill) {
                    if (typeof (fill) === 'string')
                        fill = Ui.Color.create(fill);
                    this._fill = fill;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "radius", {
            set: function (radius) {
                this.radiusTopLeft = radius;
                this.radiusTopRight = radius;
                this.radiusBottomLeft = radius;
                this.radiusBottomRight = radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "radiusTopLeft", {
            get: function () {
                return this._radiusTopLeft;
            },
            set: function (radiusTopLeft) {
                if (this._radiusTopLeft != radiusTopLeft) {
                    this._radiusTopLeft = radiusTopLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "radiusTopRight", {
            get: function () {
                return this._radiusTopRight;
            },
            set: function (radiusTopRight) {
                if (this._radiusTopRight != radiusTopRight) {
                    this._radiusTopRight = radiusTopRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "radiusBottomLeft", {
            get: function () {
                return this._radiusBottomLeft;
            },
            set: function (radiusBottomLeft) {
                if (this._radiusBottomLeft != radiusBottomLeft) {
                    this._radiusBottomLeft = radiusBottomLeft;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Frame.prototype, "radiusBottomRight", {
            get: function () {
                return this._radiusBottomRight;
            },
            set: function (radiusBottomRight) {
                if (this._radiusBottomRight != radiusBottomRight) {
                    this._radiusBottomRight = radiusBottomRight;
                    this.invalidateDraw();
                }
            },
            enumerable: true,
            configurable: true
        });
        Frame.prototype.updateCanvas = function (ctx) {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            var topLeft = this._radiusTopLeft;
            var topRight = this._radiusTopRight;
            if (topLeft + topRight > w) {
                topLeft = w / 2;
                topRight = w / 2;
            }
            var bottomLeft = this._radiusBottomLeft;
            var bottomRight = this._radiusBottomRight;
            if (bottomLeft + bottomRight > w) {
                bottomLeft = w / 2;
                bottomRight = w / 2;
            }
            if (topLeft + bottomLeft > h) {
                topLeft = h / 2;
                bottomLeft = h / 2;
            }
            if (topRight + bottomRight > h) {
                topRight = h / 2;
                bottomRight = h / 2;
            }
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, topLeft, topRight, bottomRight, bottomLeft);
            ctx.roundRect(this._frameWidth, this._frameWidth, w - (this._frameWidth * 2), h - (this._frameWidth * 2), Math.max(0, topLeft - this.frameWidth), Math.max(0, topRight - this.frameWidth), Math.max(0, bottomRight - this.frameWidth), Math.max(0, bottomLeft - this.frameWidth), true);
            ctx.closePath();
            if (this._fill instanceof Ui.Color)
                ctx.fillStyle = this._fill.getCssRgba();
            else if (this._fill instanceof Ui.LinearGradient)
                ctx.fillStyle = this._fill.getCanvasGradient(ctx, w, h);
            ctx.fill();
        };
        return Frame;
    }(Ui.CanvasElement));
    Ui.Frame = Frame;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ScaleBox = (function (_super) {
        __extends(ScaleBox, _super);
        function ScaleBox() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._fixedWidth = 400;
            _this._fixedHeight = 300;
            return _this;
        }
        ScaleBox.prototype.setFixedSize = function (width, height) {
            var changed = false;
            if ((width !== undefined) && (this._fixedWidth !== width)) {
                this._fixedWidth = width;
                changed = true;
            }
            if ((height !== undefined) && (this._fixedHeight !== height)) {
                this._fixedHeight = height;
                changed = true;
            }
            if (changed)
                this.invalidateMeasure();
        };
        Object.defineProperty(ScaleBox.prototype, "fixedWidth", {
            set: function (width) {
                this.setFixedSize(width, undefined);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScaleBox.prototype, "fixedHeight", {
            set: function (height) {
                this.setFixedSize(undefined, height);
            },
            enumerable: true,
            configurable: true
        });
        ScaleBox.prototype.append = function (child) {
            child.setTransformOrigin(0, 0);
            this.appendChild(child);
        };
        ScaleBox.prototype.remove = function (child) {
            this.removeChild(child);
            child.setTransformOrigin(0.5, 0.5);
        };
        ScaleBox.prototype.setContent = function (content) {
            this.clear();
            this.append(content);
        };
        ScaleBox.prototype.measureCore = function (width, height) {
            var ratio = this._fixedWidth / this._fixedHeight;
            var aratio = width / height;
            var aw, ah;
            if (ratio > aratio) {
                aw = width;
                ah = aw / ratio;
            }
            else {
                ah = height;
                aw = ah * ratio;
            }
            for (var i = 0; i < this.children.length; i++)
                this.children[i].measure(this._fixedWidth, this._fixedHeight);
            return { width: aw, height: ah };
        };
        ScaleBox.prototype.arrangeCore = function (width, height) {
            var ratio = this._fixedWidth / this._fixedHeight;
            var aratio = width / height;
            var aw, ah, ax, ay;
            if (ratio > aratio) {
                aw = width;
                ah = aw / ratio;
                ax = 0;
                ay = (height - ah) / 2;
            }
            else {
                ah = height;
                aw = ah * ratio;
                ay = 0;
                ax = (width - aw) / 2;
            }
            var scale = aw / this._fixedWidth;
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                child.arrange(ax, ay, this._fixedWidth, this._fixedHeight);
                child.transform = Ui.Matrix.createScale(scale, scale);
            }
        };
        return ScaleBox;
    }(Ui.Container));
    Ui.ScaleBox = ScaleBox;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var TextArea = (function (_super) {
        __extends(TextArea, _super);
        function TextArea() {
            var _this = _super.call(this) || this;
            _this._fontSize = undefined;
            _this._fontFamily = undefined;
            _this._fontWeight = undefined;
            _this._color = undefined;
            _this._value = '';
            _this.addEvents('change');
            _this.selectable = true;
            _this.focusable = true;
            _this.connect(_this.drawing, 'change', _this.onChange);
            _this.connect(_this.drawing, 'paste', _this.onPaste);
            _this.connect(_this.drawing, 'keydown', _this.onKeyDown);
            _this.connect(_this.drawing, 'keyup', _this.onKeyUp);
            return _this;
        }
        Object.defineProperty(TextArea.prototype, "fontSize", {
            get: function () {
                if (this._fontSize !== undefined)
                    return this._fontSize;
                else
                    return this.getStyleProperty('fontSize');
            },
            set: function (fontSize) {
                if (this._fontSize != fontSize) {
                    this._fontSize = fontSize;
                    this.drawing.style.fontSize = this.fontSize + 'px';
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextArea.prototype, "fontFamily", {
            get: function () {
                if (this._fontFamily !== undefined)
                    return this._fontFamily;
                else
                    return this.getStyleProperty('fontFamily');
            },
            set: function (fontFamily) {
                if (this._fontFamily !== fontFamily) {
                    this._fontFamily = fontFamily;
                    this.drawing.style.fontFamily = this.fontFamily;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextArea.prototype, "fontWeight", {
            get: function () {
                if (this._fontWeight !== undefined)
                    return this._fontWeight;
                else
                    return this.getStyleProperty('fontWeight');
            },
            set: function (fontWeight) {
                if (this._fontWeight !== fontWeight) {
                    this._fontWeight = fontWeight;
                    this.drawing.style.fontWeight = this.fontWeight;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextArea.prototype, "color", {
            set: function (color) {
                if (this._color !== color) {
                    this._color = Ui.Color.create(color);
                    if (Core.Navigator.supportRgba)
                        this.drawing.style.color = this.getColor().getCssRgba();
                    else
                        this.drawing.style.color = this.getColor().getCssHtml();
                }
            },
            enumerable: true,
            configurable: true
        });
        TextArea.prototype.getColor = function () {
            if (this._color !== undefined)
                return this._color;
            else
                return Ui.Color.create(this.getStyleProperty('color'));
        };
        Object.defineProperty(TextArea.prototype, "value", {
            get: function () {
                return this.drawing.value;
            },
            set: function (value) {
                if ((value === null) || (value === undefined))
                    this.drawing.value = '';
                else
                    this.drawing.value = value;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        TextArea.prototype.setOffset = function (offsetX, offsetY) {
            this.drawing.scrollLeft = offsetX;
            this.drawing.scrollTop = offsetY;
        };
        Object.defineProperty(TextArea.prototype, "offsetX", {
            get: function () {
                return this.drawing.scrollLeft;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextArea.prototype, "offsetY", {
            get: function () {
                return this.drawing.scrollTop;
            },
            enumerable: true,
            configurable: true
        });
        TextArea.prototype.onPaste = function (event) {
            event.stopPropagation();
            new Core.DelayedTask(this, 0, this.onAfterPaste);
        };
        TextArea.prototype.onAfterPaste = function () {
            if (this.drawing.value != this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
            }
        };
        TextArea.prototype.onChange = function (event) {
            if (this.drawing.value != this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
                this.invalidateMeasure();
            }
        };
        TextArea.prototype.onKeyDown = function (event) {
            var key = event.which;
            if ((key == 37) || (key == 39) || (key == 38) || (key == 40) || (key == 46) || (key == 8))
                event.stopPropagation();
        };
        TextArea.prototype.onKeyUp = function (event) {
            var key = event.which;
            if ((key == 37) || (key == 39) || (key == 38) || (key == 40) || (key == 46) || (key == 8))
                event.stopPropagation();
            if (this.drawing.value !== this._value) {
                this._value = this.drawing.value;
                this.fireEvent('change', this, this._value);
                this.invalidateMeasure();
            }
        };
        TextArea.prototype.renderDrawing = function () {
            var drawing = document.createElement('textarea');
            drawing.setAttribute('rows', '1');
            drawing.setAttribute('cols', '1');
            drawing.style.opacity = '1';
            drawing.style.display = 'block';
            drawing.style.resize = 'none';
            drawing.style.overflow = 'hidden';
            drawing.style.border = '0px';
            drawing.style.margin = '0px';
            drawing.style.padding = '0px';
            drawing.style.outline = 'none';
            if (Core.Navigator.isIE)
                drawing.style.backgroundColor = 'rgba(255,255,255,0.01)';
            else
                drawing.style.background = 'none';
            if (Core.Navigator.isWebkit)
                drawing.style.webkitAppearance = 'none';
            drawing.style.fontSize = this.fontSize + 'px';
            drawing.style.fontFamily = this.fontFamily;
            drawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                drawing.style.color = this.getColor().getCssRgba();
            else
                drawing.style.color = this.getColor().getCssHtml();
            return drawing;
        };
        TextArea.prototype.measureCore = function (width, height) {
            this.drawing.style.width = width + 'px';
            this.drawing.style.height = '0px';
            var size = { width: this.drawing.scrollWidth, height: Math.max(this.fontSize * 3 / 2, this.drawing.scrollHeight) };
            this.drawing.style.width = this.layoutWidth + 'px';
            this.drawing.style.height = this.layoutHeight + 'px';
            return size;
        };
        TextArea.prototype.arrangeCore = function (width, height) {
            this.drawing.style.width = width + 'px';
            this.drawing.style.height = height + 'px';
        };
        TextArea.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.drawing.blur();
            this.drawing.style.cursor = 'default';
            this.drawing.disabled = true;
        };
        TextArea.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.drawing.style.cursor = 'auto';
            this.drawing.disabled = false;
        };
        TextArea.prototype.onStyleChange = function () {
            this.drawing.style.fontSize = this.fontSize + 'px';
            this.drawing.style.fontFamily = this.fontFamily;
            this.drawing.style.fontWeight = this.fontWeight;
            if (Core.Navigator.supportRgba)
                this.drawing.style.color = this.getColor().getCssRgba();
            else
                this.drawing.style.color = this.getColor().getCssHtml();
            this.invalidateMeasure();
        };
        TextArea.style = {
            color: new Ui.Color(),
            fontSize: 14,
            fontFamily: 'Sans-serif',
            fontWeight: 'normal'
        };
        return TextArea;
    }(Ui.Element));
    Ui.TextArea = TextArea;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var TextAreaField = (function (_super) {
        __extends(TextAreaField, _super);
        function TextAreaField() {
            var _this = _super.call(this) || this;
            _this.addEvents('change');
            _this.padding = 3;
            _this.graphic = new Ui.TextBgGraphic();
            _this.append(_this.graphic);
            _this.textholder = new Ui.Label();
            _this.textholder.opacity = 0.5;
            _this.textholder.horizontalAlign = 'center';
            _this.textholder.margin = 3;
            _this.append(_this.textholder);
            _this.textarea = new Ui.TextArea();
            _this.textarea.margin = 4;
            _this.textarea.fontSize = 16;
            _this.append(_this.textarea);
            _this.connect(_this.textarea, 'focus', _this.onTextAreaFocus);
            _this.connect(_this.textarea, 'blur', _this.onTextAreaBlur);
            _this.connect(_this.textarea, 'change', _this.onTextAreaChange);
            return _this;
        }
        Object.defineProperty(TextAreaField.prototype, "textHolder", {
            set: function (text) {
                this.textholder.text = text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextAreaField.prototype, "value", {
            get: function () {
                return this.textarea.value;
            },
            set: function (value) {
                this.textarea.value = value;
                if ((value === undefined) || (value === ''))
                    this.textholder.show();
                else
                    this.textholder.hide();
            },
            enumerable: true,
            configurable: true
        });
        TextAreaField.prototype.onTextAreaFocus = function () {
            this.textholder.hide();
            this.graphic.hasFocus = true;
        };
        TextAreaField.prototype.onTextAreaBlur = function () {
            if (this.value === '')
                this.textholder.show();
            this.graphic.hasFocus = false;
        };
        TextAreaField.prototype.onTextAreaChange = function (entry, value) {
            this.fireEvent('change', this, value);
        };
        return TextAreaField;
    }(Ui.LBox));
    Ui.TextAreaField = TextAreaField;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Grid = (function (_super) {
        __extends(Grid, _super);
        function Grid(init) {
            var _this = _super.call(this) || this;
            _this._cols = [{ auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 }];
            _this._rows = [{ auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 }];
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Grid.prototype, "cols", {
            set: function (colsDef) {
                this._cols = [];
                var cols = colsDef.split(',');
                for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    if (col == 'auto')
                        this._cols.push({ auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 });
                    else if (col == '*')
                        this._cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: 1 });
                    else if (col.match(/^[0-9]+\.?[0-9]*\*$/))
                        this._cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: parseInt(col.slice(0, col.length - 1)) });
                    else if (col.match(/^[0-9]+$/))
                        this._cols.push({ auto: false, star: false, absolute: true, actualWidth: 0, offset: 0, width: parseInt(col) });
                    else if (DEBUG)
                        throw ('Ui.Grid column definition "' + col + '" not supported');
                }
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Grid.prototype, "rows", {
            set: function (rowsDef) {
                this._rows = [];
                var rows = rowsDef.split(',');
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (row == 'auto')
                        this._rows.push({ auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 });
                    else if (row == '*')
                        this._rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: 1 });
                    else if (row.match(/^[0-9]+\.?[0-9]*\*$/))
                        this._rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: parseInt(row.slice(0, row.length - 1)) });
                    else if (row.match(/^[0-9]+$/))
                        this._rows.push({ auto: false, star: false, absolute: true, actualHeight: 0, offset: 0, height: parseInt(row) });
                    else if (DEBUG)
                        throw ('Ui.Grid row definition "' + row + '" not supported');
                }
            },
            enumerable: true,
            configurable: true
        });
        Grid.prototype.setContent = function (content) {
            while (this.firstChild !== undefined)
                this.removeChild(this.firstChild);
            if ((content !== undefined) && (typeof (content) === 'object')) {
                if (content.constructor == Array) {
                    for (var i = 0; i < content.length; i++)
                        this.appendChild(content[i]);
                }
                else
                    this.appendChild(content);
            }
        };
        Grid.prototype.attach = function (child, col, row, colSpan, rowSpan) {
            if (colSpan === void 0) { colSpan = 1; }
            if (rowSpan === void 0) { rowSpan = 1; }
            Grid.setCol(child, col);
            Grid.setRow(child, row);
            Grid.setColSpan(child, colSpan);
            Grid.setRowSpan(child, rowSpan);
            this.appendChild(child);
        };
        Grid.prototype.detach = function (child) {
            this.removeChild(child);
        };
        Grid.prototype.getColMin = function (colPos) {
            var i;
            var i2;
            var currentColumn;
            var col = this._cols[colPos];
            var min = 0;
            for (i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var childCol = Ui.Grid.getCol(child);
                var childColSpan = Ui.Grid.getColSpan(child);
                if ((childColSpan == 1) && (childCol == colPos)) {
                    if (child.measureWidth > min)
                        min = child.measureWidth;
                }
                else if ((childCol <= colPos) && (childCol + childColSpan > colPos)) {
                    var isLastAuto = true;
                    var hasStar = false;
                    var prev = 0.0;
                    for (i2 = childCol; i2 < colPos; i2++) {
                        currentColumn = this._cols[i2];
                        prev += currentColumn.actualWidth;
                        if (currentColumn.star) {
                            hasStar = true;
                            break;
                        }
                    }
                    if (!hasStar) {
                        for (i2 = colPos + 1; i2 < childCol + childColSpan; i2++) {
                            currentColumn = this._cols[i2];
                            if (currentColumn.star) {
                                hasStar = true;
                                break;
                            }
                            if (currentColumn.auto) {
                                isLastAuto = false;
                                break;
                            }
                        }
                    }
                    if (!hasStar && isLastAuto) {
                        if ((child.measureWidth - prev) > min)
                            min = child.measureWidth - prev;
                    }
                }
            }
            return min;
        };
        Grid.prototype.getRowMin = function (rowPos) {
            var i;
            var i2;
            var currentRow;
            var row = this._rows[rowPos];
            var min = 0;
            for (i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var childRow = Ui.Grid.getRow(child);
                var childRowSpan = Ui.Grid.getRowSpan(child);
                if ((childRowSpan == 1) && (childRow == rowPos)) {
                    if (child.measureHeight > min)
                        min = child.measureHeight;
                }
                else if ((childRow <= rowPos) && (childRow + childRowSpan > rowPos)) {
                    var isLastAuto = true;
                    var hasStar = false;
                    var prev = 0.0;
                    for (i2 = childRow; i2 < rowPos; i2++) {
                        currentRow = this._rows[i2];
                        prev += currentRow.actualHeight;
                        if (currentRow.star) {
                            hasStar = true;
                            break;
                        }
                    }
                    if (!hasStar) {
                        for (i2 = rowPos + 1; i2 < childRow + childRowSpan; i2++) {
                            currentRow = this._rows[i2];
                            if (currentRow.star) {
                                hasStar = true;
                                break;
                            }
                            if (currentRow.auto) {
                                isLastAuto = false;
                                break;
                            }
                        }
                    }
                    if (!hasStar && isLastAuto) {
                        if ((child.measureHeight - prev) > min)
                            min = child.measureHeight - prev;
                    }
                }
            }
            return min;
        };
        Grid.prototype.measureCore = function (width, height) {
            var i;
            var child;
            var col;
            var colSpan;
            var colPos;
            var childX;
            var childWidth;
            var x;
            var row;
            var rowPos;
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                var constraintWidth = (width * Ui.Grid.getColSpan(child)) / this._cols.length;
                var constraintHeight = (height * Ui.Grid.getRowSpan(child)) / this._rows.length;
                child.measure(constraintWidth, constraintHeight);
            }
            var colStarCount = 0.0;
            var colStarSize = 0.0;
            var rowStarCount = 0.0;
            var rowStarSize = 0.0;
            var offsetX = 0;
            for (colPos = 0; colPos < this._cols.length; colPos++) {
                col = this._cols[colPos];
                col.offset = offsetX;
                if (col.absolute)
                    col.actualWidth += col.width;
                else if (col.star) {
                    col.actualWidth = 0;
                    colStarCount += col.width;
                }
                else if (col.auto) {
                    col.actualWidth = this.getColMin(colPos);
                }
                offsetX += col.actualWidth;
            }
            var starWidth = 0.0;
            if (colStarCount > 0.0)
                starWidth = (width - offsetX) / colStarCount;
            offsetX = 0;
            for (i = 0; i < this._cols.length; i++) {
                col = this._cols[i];
                col.offset = offsetX;
                if (col.star)
                    col.actualWidth = starWidth * col.width;
                offsetX += col.actualWidth;
            }
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                col = Ui.Grid.getCol(child);
                colSpan = Ui.Grid.getColSpan(child);
                childX = this._cols[col].offset;
                childWidth = 0.0;
                for (x = col; x < col + colSpan; x++)
                    childWidth += this._cols[x].actualWidth;
                child.measure(childWidth, height);
            }
            offsetX = 0;
            for (colPos = 0; colPos < this._cols.length; colPos++) {
                col = this._cols[colPos];
                col.offset = offsetX;
                if (col.absolute) {
                    col.actualWidth = col.width;
                }
                else if (col.star) {
                    col.actualWidth = Math.max(this.getColMin(colPos), starWidth * col.width);
                    colStarSize += col.actualWidth;
                }
                else if (col.auto) {
                    col.actualWidth = this.getColMin(colPos);
                }
                offsetX += col.actualWidth;
            }
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                col = Ui.Grid.getCol(child);
                colSpan = Ui.Grid.getColSpan(child);
                childX = this._cols[col].offset;
                childWidth = 0.0;
                for (x = col; x < col + colSpan; x++)
                    childWidth += this._cols[x].actualWidth;
                child.measure(childWidth, height);
            }
            var offsetY = 0;
            for (rowPos = 0; rowPos < this._rows.length; rowPos++) {
                row = this._rows[rowPos];
                row.offset = offsetY;
                if (row.absolute)
                    row.actualHeight = row.height;
                else if (row.star) {
                    row.actualHeight = 0;
                    rowStarCount += row.height;
                }
                else if (row.auto)
                    row.actualHeight = this.getRowMin(rowPos);
                offsetY += row.actualHeight;
            }
            var starHeight = 0.0;
            if (rowStarCount > 0.0)
                starHeight = (height - offsetY) / rowStarCount;
            offsetY = 0;
            for (i = 0; i < this._rows.length; i++) {
                row = this._rows[i];
                row.offset = offsetY;
                if (row.star)
                    row.actualHeight = starHeight * row.height;
                offsetY += row.actualHeight;
            }
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                col = Ui.Grid.getCol(child);
                colSpan = Ui.Grid.getColSpan(child);
                childX = this._cols[col].offset;
                childWidth = 0.0;
                for (x = col; x < col + colSpan; x++)
                    childWidth += this._cols[x].actualWidth;
                row = Ui.Grid.getRow(child);
                var rowSpan = Ui.Grid.getRowSpan(child);
                var childY = this._rows[row].offset;
                var childHeight = 0.0;
                for (var y = row; y < row + rowSpan; y++)
                    childHeight += this._rows[y].actualHeight;
                child.measure(childWidth, childHeight);
            }
            offsetY = 0;
            for (rowPos = 0; rowPos < this._rows.length; rowPos++) {
                row = this._rows[rowPos];
                row.offset = offsetY;
                if (row.absolute) {
                    row.actualHeight = row.height;
                }
                else if (row.star) {
                    var rowMin = this.getRowMin(rowPos);
                    row.actualHeight = Math.max(rowMin, starHeight * row.height);
                    rowStarSize += row.actualHeight;
                }
                else if (row.auto) {
                    row.actualHeight = this.getRowMin(rowPos);
                }
                offsetY += row.actualHeight;
            }
            return { width: offsetX, height: offsetY };
        };
        Grid.prototype.arrangeCore = function (width, height) {
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var col = Ui.Grid.getCol(child);
                var colSpan = Ui.Grid.getColSpan(child);
                var row = Ui.Grid.getRow(child);
                var rowSpan = Ui.Grid.getRowSpan(child);
                var childX = this._cols[col].offset;
                var childY = this._rows[row].offset;
                var childWidth = 0.0;
                var childHeight = 0.0;
                for (var x = col; x < col + colSpan; x++)
                    childWidth += this._cols[x].actualWidth;
                for (var y = row; y < row + rowSpan; y++)
                    childHeight += this._rows[y].actualHeight;
                child.arrange(childX, childY, childWidth, childHeight);
            }
        };
        Grid.getCol = function (child) {
            return (child['Ui.Grid.col'] !== undefined) ? child['Ui.Grid.col'] : 0;
        };
        Grid.setCol = function (child, col) {
            if (Ui.Grid.getCol(child) != col) {
                child['Ui.Grid.col'] = col;
                child.invalidateMeasure();
            }
        };
        Grid.getRow = function (child) {
            return (child['Ui.Grid.row'] !== undefined) ? child['Ui.Grid.row'] : 0;
        };
        Grid.setRow = function (child, row) {
            if (Ui.Grid.getRow(child) !== row) {
                child['Ui.Grid.row'] = row;
                child.invalidateMeasure();
            }
        };
        Grid.getColSpan = function (child) {
            return (child['Ui.Grid.colSpan'] !== undefined) ? child['Ui.Grid.colSpan'] : 1;
        };
        Grid.setColSpan = function (child, colSpan) {
            if (Ui.Grid.getColSpan(child) !== colSpan) {
                child['Ui.Grid.colSpan'] = colSpan;
                child.invalidateMeasure();
            }
        };
        Grid.getRowSpan = function (child) {
            return (child['Ui.Grid.rowSpan'] !== undefined) ? child['Ui.Grid.rowSpan'] : 1;
        };
        Grid.setRowSpan = function (child, rowSpan) {
            if (Ui.Grid.getRowSpan(child) !== rowSpan) {
                child['Ui.Grid.rowSpan'] = rowSpan;
                child.invalidateMeasure();
            }
        };
        return Grid;
    }(Ui.Container));
    Ui.Grid = Grid;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Flow = (function (_super) {
        __extends(Flow, _super);
        function Flow(init) {
            var _this = _super.call(this) || this;
            _this._uniform = false;
            _this.uniformWidth = undefined;
            _this.uniformHeight = undefined;
            _this._itemAlign = 'left';
            _this._spacing = 0;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Flow.prototype, "content", {
            set: function (content) {
                while (this.firstChild !== undefined)
                    this.removeChild(this.firstChild);
                if (content != undefined) {
                    for (var i = 0; i < content.length; i++)
                        this.appendChild(content[i]);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Flow.prototype, "spacing", {
            get: function () {
                return this._spacing;
            },
            set: function (spacing) {
                if (this._spacing != spacing) {
                    this._spacing = spacing;
                    this.invalidateMeasure();
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Flow.prototype, "itemAlign", {
            get: function () {
                return this._itemAlign;
            },
            set: function (itemAlign) {
                if (itemAlign != this._itemAlign) {
                    this._itemAlign = itemAlign;
                    this.invalidateMeasure();
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Flow.prototype, "uniform", {
            get: function () {
                return this._uniform;
            },
            set: function (uniform) {
                if (this._uniform != uniform) {
                    this._uniform = uniform;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Flow.prototype.append = function (child) {
            this.appendChild(child);
        };
        Flow.prototype.prepend = function (child) {
            this.prependChild(child);
        };
        Flow.prototype.insertAt = function (child, position) {
            this.insertChildAt(child, position);
        };
        Flow.prototype.moveAt = function (child, position) {
            this.moveChildAt(child, position);
        };
        Flow.prototype.remove = function (child) {
            this.removeChild(child);
        };
        Flow.prototype.measureChildrenNonUniform = function (width, height) {
            var line = { pos: 0, y: 0, width: 0, height: 0 };
            var ctx = { lineX: 0, lineY: 0, lineCount: 0, lineHeight: 0, minWidth: 0 };
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                var size = child.measure(width, height);
                var isFirst = (ctx.lineX === 0);
                if (!isFirst && (ctx.lineX + size.width + (!isFirst ? this._spacing : 0) > width)) {
                    line.width = ctx.lineX;
                    line.height = ctx.lineHeight;
                    ctx.lineX = 0;
                    ctx.lineY += ctx.lineHeight + this._spacing;
                    ctx.lineHeight = 0;
                    isFirst = true;
                    ctx.lineCount++;
                    line = { pos: ctx.lineCount, y: ctx.lineY, width: 0, height: 0 };
                }
                child['Ui.Flow.flowLine'] = line;
                if (!isFirst)
                    ctx.lineX += this._spacing;
                child['Ui.Flow.flowLineX'] = ctx.lineX;
                ctx.lineX += size.width;
                if (size.height > ctx.lineHeight)
                    ctx.lineHeight = size.height;
                if (ctx.lineX > ctx.minWidth)
                    ctx.minWidth = ctx.lineX;
            }
            ctx.lineY += ctx.lineHeight;
            line.width = ctx.lineX;
            line.height = ctx.lineHeight;
            return { width: ctx.minWidth, height: ctx.lineY };
        };
        Flow.prototype.measureChildrenUniform = function (width, height) {
            var i;
            var child;
            var size;
            var maxWidth = 0;
            var maxHeight = 0;
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                size = child.measure(width, height);
                if (size.width > maxWidth)
                    maxWidth = size.width;
                if (size.height > maxHeight)
                    maxHeight = size.height;
            }
            var countPerLine = Math.max(Math.floor((width + this._spacing) / (maxWidth + this._spacing)), 1);
            var nbLine = Math.ceil(this.children.length / countPerLine);
            for (i = 0; i < this.children.length; i++)
                this.children[i].measure(maxWidth, maxHeight);
            this.uniformWidth = maxWidth;
            this.uniformHeight = maxHeight;
            return {
                width: maxWidth * countPerLine + (countPerLine - 1) * this._spacing,
                height: nbLine * maxHeight + (nbLine - 1) * this._spacing
            };
        };
        Flow.prototype.measureCore = function (width, height) {
            if (this.children.length === 0)
                return { width: 0, height: 0 };
            if (this._uniform)
                return this.measureChildrenUniform(width, height);
            else
                return this.measureChildrenNonUniform(width, height);
        };
        Flow.prototype.arrangeCore = function (width, height) {
            if (this._uniform) {
                if (this._itemAlign === 'left') {
                    var x = 0;
                    var y = 0;
                    for (var i = 0; i < this.children.length; i++) {
                        var child = this.children[i];
                        if (x + this.uniformWidth > width) {
                            x = 0;
                            y += this.uniformHeight + this._spacing;
                        }
                        child.arrange(x, y, this.uniformWidth, this.uniformHeight);
                        x += this.uniformWidth + this._spacing;
                    }
                }
                else if (this._itemAlign === 'right') {
                    var nbItemPerLine = Math.max(Math.floor((width + this._spacing) / (this.uniformWidth + this._spacing)), 1);
                    var lineWidth = nbItemPerLine * this.uniformWidth + (nbItemPerLine - 1) * this._spacing;
                    var x = 0;
                    if (this.children.length < nbItemPerLine)
                        x = width - ((this.children.length * (this.uniformWidth + this._spacing)) - this._spacing);
                    else
                        x = width - lineWidth;
                    var y = 0;
                    for (var i = 0; i < this.children.length; i++) {
                        var child = this.children[i];
                        if (x + this.uniformWidth > width) {
                            if (this.children.length - i < nbItemPerLine)
                                x = width - (((this.children.length - i) * (this.uniformWidth + this._spacing)) - this._spacing);
                            else
                                x = width - lineWidth;
                            y += this.uniformHeight + this._spacing;
                        }
                        child.arrange(x, y, this.uniformWidth, this.uniformHeight);
                        x += this.uniformWidth + this._spacing;
                    }
                }
            }
            else {
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    if (this._itemAlign == 'left')
                        child.arrange(child['Ui.Flow.flowLineX'], child['Ui.Flow.flowLine'].y, child.measureWidth, child['Ui.Flow.flowLine'].height);
                    else
                        child.arrange(child['Ui.Flow.flowLineX'] + (width - child['Ui.Flow.flowLine'].width), child['Ui.Flow.flowLine'].y, child.measureWidth, child['Ui.Flow.flowLine'].height);
                }
            }
        };
        return Flow;
    }(Ui.Container));
    Ui.Flow = Flow;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ProgressBar = (function (_super) {
        __extends(ProgressBar, _super);
        function ProgressBar(init) {
            var _this = _super.call(this) || this;
            _this._value = 0;
            _this.background = new Ui.Rectangle({ height: 4 });
            _this.appendChild(_this.background);
            _this.bar = new Ui.Rectangle({ height: 4 });
            _this.appendChild(_this.bar);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(ProgressBar.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (value != this._value) {
                    this._value = value;
                    var barWidth = this.layoutWidth * this._value;
                    if (barWidth < 2)
                        this.bar.hide();
                    else {
                        this.bar.show();
                        this.bar.arrange(0, 0, barWidth, this.layoutHeight);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        ProgressBar.prototype.measureCore = function (width, height) {
            var minHeight = 0;
            var minWidth = 0;
            var size;
            size = this.bar.measure(width, height);
            minHeight = Math.max(size.height, minHeight);
            minWidth = Math.max(size.width, minWidth);
            size = this.background.measure(width, height);
            minHeight = Math.max(size.height, minHeight);
            minWidth = Math.max(size.width, minWidth);
            return { width: Math.max(minWidth, 12), height: minHeight };
        };
        ProgressBar.prototype.arrangeCore = function (width, height) {
            this.background.arrange(0, 0, width, height);
            var barWidth = width * this._value;
            if (barWidth < 2)
                this.bar.hide();
            else {
                this.bar.show();
                this.bar.arrange(0, 0, barWidth, this.layoutHeight);
            }
        };
        ProgressBar.prototype.onStyleChange = function () {
            var radius = this.getStyleProperty('radius');
            this.bar.radius = radius;
            this.bar.fill = this.getStyleProperty('foreground');
            this.background.radius = radius;
            this.background.fill = this.getStyleProperty('background');
        };
        ProgressBar.style = {
            background: '#e1e1e1',
            foreground: '#07a0e5',
            color: '#999999',
            radius: 0
        };
        return ProgressBar;
    }(Ui.Container));
    Ui.ProgressBar = ProgressBar;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Combo = (function (_super) {
        __extends(Combo, _super);
        function Combo(init) {
            var _this = _super.call(this) || this;
            _this._position = -1;
            _this._placeHolder = '...';
            _this.addEvents('change');
            _this.arrowtop = new Ui.Icon({ icon: 'arrowtop', width: 10, height: 10 });
            _this.arrowbottom = new Ui.Icon({ icon: 'arrowbottom', width: 10, height: 10 });
            _this.marker = new Ui.VBox({
                verticalAlign: 'center',
                content: [_this.arrowtop, _this.arrowbottom], marginRight: 5
            });
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Combo.prototype, "placeHolder", {
            set: function (placeHolder) {
                this._placeHolder = placeHolder;
                if (this._position === -1)
                    this.text = this._placeHolder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Combo.prototype, "field", {
            set: function (field) {
                this._field = field;
                if (this._data !== undefined)
                    this.data = this._data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Combo.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (data) {
                this._data = data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Combo.prototype, "position", {
            get: function () {
                return this._position;
            },
            set: function (position) {
                if (position === -1) {
                    this._position = -1;
                    this._current = undefined;
                    this.text = this._placeHolder;
                    this.fireEvent('change', this, this._current, this._position);
                }
                else if ((position >= 0) && (position < this._data.length)) {
                    this._current = this._data[position];
                    this._position = position;
                    this.text = this._current[this._field];
                    this.fireEvent('change', this, this._current, this._position);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Combo.prototype, "current", {
            get: function () {
                return this._current;
            },
            set: function (current) {
                if (current == undefined)
                    this.position = -1;
                var position = -1;
                for (var i = 0; i < this._data.length; i++) {
                    if (this._data[i] == current) {
                        position = i;
                        break;
                    }
                }
                if (position != -1)
                    this.position = position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Combo.prototype, "value", {
            get: function () {
                return this._current;
            },
            enumerable: true,
            configurable: true
        });
        Combo.prototype.onItemPress = function (popup, item, position) {
            this.position = position;
        };
        Combo.prototype.onPress = function () {
            var popup = new Ui.ComboPopup({ field: this._field, data: this._data });
            if (this._position !== -1)
                popup.position = this._position;
            this.connect(popup, 'item', this.onItemPress);
            popup.openElement(this, 'right');
        };
        Combo.prototype.updateColors = function () {
            _super.prototype.updateColors.call(this);
            this.arrowtop.fill = this.getForegroundColor();
            this.arrowbottom.fill = this.getForegroundColor();
        };
        Combo.style = {
            textTransform: 'none'
        };
        return Combo;
    }(Ui.Button));
    Ui.Combo = Combo;
    var ComboPopup = (function (_super) {
        __extends(ComboPopup, _super);
        function ComboPopup(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('item');
            _this.autoClose = true;
            _this.list = new Ui.VBox();
            _this.content = _this.list;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(ComboPopup.prototype, "field", {
            set: function (field) {
                this._field = field;
                if (this._data !== undefined)
                    this.data = this._data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComboPopup.prototype, "data", {
            set: function (data) {
                this._data = data;
                if (this._field === undefined)
                    return;
                for (var i = 0; i < data.length; i++) {
                    var item = new ComboItem({ text: data[i][this._field] });
                    this.connect(item, 'press', this.onItemPress);
                    this.list.append(item);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComboPopup.prototype, "position", {
            set: function (position) {
                this.list.children[position].isActive = true;
            },
            enumerable: true,
            configurable: true
        });
        ComboPopup.prototype.onItemPress = function (item) {
            var position = -1;
            for (var i = 0; i < this.list.children.length; i++) {
                if (this.list.children[i] == item) {
                    position = i;
                    break;
                }
            }
            this.fireEvent('item', this, item, position);
            this.close();
        };
        return ComboPopup;
    }(Ui.MenuPopup));
    Ui.ComboPopup = ComboPopup;
    var ComboItem = (function (_super) {
        __extends(ComboItem, _super);
        function ComboItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ComboItem.style = {
            borderWidth: 0,
            textTransform: 'none'
        };
        return ComboItem;
    }(Ui.Button));
    Ui.ComboItem = ComboItem;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Paned = (function (_super) {
        __extends(Paned, _super);
        function Paned(init) {
            var _this = _super.call(this) || this;
            _this.vertical = true;
            _this.minContent1Size = 0;
            _this.minContent2Size = 0;
            _this._pos = 0.5;
            _this.addEvents('change');
            _this.content1Box = new Ui.LBox();
            _this.appendChild(_this.content1Box);
            _this.content2Box = new Ui.LBox();
            _this.appendChild(_this.content2Box);
            _this.cursor = new Ui.Movable();
            _this.appendChild(_this.cursor);
            _this.cursor.setContent(new Ui.VPanedCursor());
            _this.connect(_this.cursor, 'move', _this.onCursorMove);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Paned.prototype, "orientation", {
            get: function () {
                if (this.vertical)
                    return 'vertical';
                else
                    return 'horizontal';
            },
            set: function (orientation) {
                var vertical = true;
                if (orientation != 'vertical')
                    vertical = false;
                if (this.vertical != vertical) {
                    this.vertical = vertical;
                    if (this.vertical)
                        this.cursor.setContent(new Ui.VPanedCursor());
                    else
                        this.cursor.setContent(new Ui.HPanedCursor());
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paned.prototype, "pos", {
            get: function () {
                return this._pos;
            },
            set: function (pos) {
                this._pos = pos;
                this.invalidateMeasure();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paned.prototype, "content1", {
            get: function () {
                return this._content1;
            },
            set: function (content1) {
                if (this._content1 !== content1) {
                    if (this._content1 !== undefined)
                        this.content1Box.remove(this._content1);
                    this._content1 = content1;
                    if (this._content1 !== undefined)
                        this.content1Box.append(this._content1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paned.prototype, "content2", {
            get: function () {
                return this._content2;
            },
            set: function (content2) {
                if (this._content2 !== content2) {
                    if (this._content2 !== undefined)
                        this.content2Box.remove(this._content2);
                    this._content2 = content2;
                    if (this._content2 !== undefined)
                        this.content2Box.append(this._content2);
                }
            },
            enumerable: true,
            configurable: true
        });
        Paned.prototype.invert = function () {
            var tmp;
            tmp = this.content1Box;
            this.content1Box = this.content2Box;
            this.content2Box = tmp;
            tmp = this._content1;
            this._content1 = this._content2;
            this._content2 = tmp;
            this._pos = 1 - this._pos;
            this.invalidateArrange();
        };
        Paned.prototype.onCursorMove = function () {
            this.disconnect(this.cursor, 'move', this.onCursorMove);
            var p;
            var aSize;
            if (this.vertical) {
                p = this.cursor.positionY;
                aSize = this.layoutHeight - this.cursor.layoutHeight;
            }
            else {
                p = this.cursor.positionX;
                aSize = this.layoutWidth - this.cursor.layoutWidth;
            }
            this._pos = p / aSize;
            if (aSize * this._pos < this.minContent1Size)
                this._pos = this.minContent1Size / aSize;
            if (aSize * (1 - this._pos) < this.minContent2Size)
                this._pos = 1 - (this.minContent2Size / aSize);
            p = this._pos * aSize;
            if (p < 0)
                p = 0;
            if (p > aSize)
                p = aSize;
            if (this.vertical)
                this.cursor.setPosition(0, p);
            else
                this.cursor.setPosition(p, 0);
            this.invalidateMeasure();
            this.connect(this.cursor, 'move', this.onCursorMove);
            this.fireEvent('change', this, this._pos);
        };
        Paned.prototype.measureCore = function (width, height) {
            var cursorSize;
            var content1Size;
            var content2Size;
            if (this.vertical) {
                cursorSize = this.cursor.measure(width, 0);
                this.minContent1Size = this.content1Box.measure(width, 0).height;
                this.minContent2Size = this.content2Box.measure(width, 0).height;
                content1Size = this.content1Box.measure(width, (height - cursorSize.height) * this._pos);
                content2Size = this.content2Box.measure(width, (height - cursorSize.height) * (1 - this._pos));
                return { width: Math.max(cursorSize.width, Math.max(content1Size.width, content2Size.width)), height: content1Size.height + cursorSize.height + content2Size.height };
            }
            else {
                cursorSize = this.cursor.measure(0, height);
                this.minContent1Size = this.content1Box.measure(0, 0).width;
                this.minContent2Size = this.content2Box.measure(0, 0).width;
                content1Size = this.content1Box.measure((width - cursorSize.width) * this._pos, height);
                content2Size = this.content2Box.measure((width - cursorSize.width) * (1 - this._pos), height);
                return { width: content1Size.width + cursorSize.width + content2Size.width, height: Math.max(cursorSize.height, Math.max(content1Size.height, content2Size.height)) };
            }
        };
        Paned.prototype.arrangeCore = function (width, height) {
            if (this.vertical) {
                var cHeight = this.cursor.measureHeight;
                var aHeight = height - cHeight;
                this.cursor.arrange(0, 0, width, cHeight);
                this.cursor.setPosition(0, aHeight * this._pos);
                this.content1Box.arrange(0, 0, width, aHeight * this._pos);
                this.content2Box.arrange(0, (aHeight * this._pos) + cHeight, width, aHeight * (1 - this._pos));
            }
            else {
                var cWidth = this.cursor.measureWidth;
                var aWidth = width - cWidth;
                this.content1Box.arrange(0, 0, aWidth * this._pos, height);
                this.cursor.arrange(0, 0, cWidth, height);
                this.cursor.setPosition(aWidth * this._pos, 0);
                this.content2Box.arrange((aWidth * this._pos) + cWidth, 0, aWidth * (1 - this._pos), height);
            }
        };
        return Paned;
    }(Ui.Container));
    Ui.Paned = Paned;
    var VPaned = (function (_super) {
        __extends(VPaned, _super);
        function VPaned() {
            var _this = _super.call(this) || this;
            _this.orientation = 'vertical';
            return _this;
        }
        return VPaned;
    }(Paned));
    Ui.VPaned = VPaned;
    var HPaned = (function (_super) {
        __extends(HPaned, _super);
        function HPaned() {
            var _this = _super.call(this) || this;
            _this.orientation = 'horizontal';
            return _this;
        }
        return HPaned;
    }(Paned));
    Ui.HPaned = HPaned;
    var HPanedCursor = (function (_super) {
        __extends(HPanedCursor, _super);
        function HPanedCursor() {
            var _this = _super.call(this) || this;
            _this.append(new Ui.Rectangle({ fill: new Ui.Color(0, 0, 0, 0.05) }));
            _this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', width: 1, margin: 5, marginRight: 10, height: 30, verticalAlign: 'center' }));
            _this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', width: 1, margin: 5, marginLeft: 10, height: 30, verticalAlign: 'center' }));
            _this.append(new Ui.Frame({ frameWidth: 1, fill: 'rgba(140,140,140,1)' }));
            return _this;
        }
        return HPanedCursor;
    }(Ui.LBox));
    Ui.HPanedCursor = HPanedCursor;
    var VPanedCursor = (function (_super) {
        __extends(VPanedCursor, _super);
        function VPanedCursor() {
            var _this = _super.call(this) || this;
            _this.append(new Ui.Rectangle({ fill: 'rgba(250,250,250,1)' }));
            _this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', height: 1, margin: 5, marginTop: 10, width: 30, horizontalAlign: 'center' }));
            _this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', height: 1, margin: 5, marginBottom: 10, width: 30, horizontalAlign: 'center' }));
            _this.append(new Ui.Frame({ frameWidth: 1, radius: 0, fill: 'rgba(140,140,140,1)' }));
            return _this;
        }
        return VPanedCursor;
    }(Ui.LBox));
    Ui.VPanedCursor = VPanedCursor;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Slider = (function (_super) {
        __extends(Slider, _super);
        function Slider(init) {
            var _this = _super.call(this) || this;
            _this._value = 0;
            _this._orientation = 'horizontal';
            _this.addEvents('change');
            _this.background = new Ui.Rectangle({ width: 4, height: 4 });
            _this.appendChild(_this.background);
            _this.bar = new Ui.Rectangle({ width: 4, height: 4 });
            _this.appendChild(_this.bar);
            _this.button = new Ui.Movable({ moveVertical: false });
            _this.appendChild(_this.button);
            _this.connect(_this.button, 'move', _this.onButtonMove);
            _this.connect(_this.button, 'focus', _this.updateColors);
            _this.connect(_this.button, 'blur', _this.updateColors);
            _this.connect(_this.button, 'down', _this.updateColors);
            _this.connect(_this.button, 'up', _this.updateColors);
            _this.buttonContent = new Ui.Rectangle({ radius: 10, width: 20, height: 20, margin: 10 });
            _this.button.setContent(_this.buttonContent);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Slider.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this.setValue(value);
            },
            enumerable: true,
            configurable: true
        });
        Slider.prototype.setValue = function (value, dontSignal) {
            if (dontSignal === void 0) { dontSignal = false; }
            value = Math.min(1, Math.max(0, value));
            if (this._value !== value) {
                this._value = value;
                this.disconnect(this.button, 'move', this.onButtonMove);
                this.updateValue();
                this.connect(this.button, 'move', this.onButtonMove);
                if (dontSignal !== true)
                    this.fireEvent('change', this, this._value);
            }
        };
        Object.defineProperty(Slider.prototype, "orientation", {
            get: function () {
                return this._orientation;
            },
            set: function (orientation) {
                if (this._orientation !== orientation) {
                    this._orientation = orientation;
                    this.button.moveHorizontal = true;
                    this.button.moveVertical = true;
                    this.updateValue();
                    if (this._orientation === 'horizontal') {
                        this.button.moveHorizontal = true;
                        this.button.moveVertical = false;
                    }
                    else {
                        this.button.moveHorizontal = false;
                        this.button.moveVertical = true;
                    }
                    this.invalidateMeasure();
                    this.onStyleChange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Slider.prototype.onButtonMove = function (button) {
            var oldValue = this._value;
            if (this.updateLock !== true) {
                var pos;
                var size;
                var max;
                if (this.orientation === 'horizontal') {
                    pos = this.button.positionX;
                    size = this.layoutWidth;
                    max = size - this.button.layoutWidth;
                }
                else {
                    size = this.layoutHeight;
                    max = size - this.button.layoutHeight;
                    pos = max - this.button.positionY;
                }
                if (pos < 0)
                    pos = 0;
                else if (pos > max)
                    pos = max;
                this._value = pos / max;
            }
            this.disconnect(this.button, 'move', this.onButtonMove);
            this.updateValue();
            this.connect(this.button, 'move', this.onButtonMove);
            if (oldValue != this._value)
                this.fireEvent('change', this, this._value);
        };
        Slider.prototype.updateValue = function () {
            this.updateLock = true;
            var max;
            var width = this.layoutWidth;
            var height = this.layoutHeight;
            if (this.orientation === 'horizontal') {
                max = width - this.button.layoutWidth;
                this.button.setPosition(max * this._value, 0);
                this.bar.arrange(this.button.layoutWidth / 2, (height - this.bar.measureHeight) / 2, max * this._value, this.bar.measureHeight);
            }
            else {
                max = height - this.button.layoutHeight;
                var x = (width - 44) / 2;
                var size = (height - 36) * this._value;
                this.button.setPosition(0, max * (1 - this._value));
                this.bar.arrange((width - this.bar.measureWidth) / 2, this.button.layoutHeight / 2 + max * (1 - this._value), this.bar.measureWidth, max * this._value);
            }
            delete (this.updateLock);
        };
        Slider.prototype.getColor = function () {
            return Ui.Color.create(this.getStyleProperty('background'));
        };
        Slider.prototype.getForeground = function () {
            return Ui.Color.create(this.getStyleProperty('foreground'));
        };
        Slider.prototype.getBackground = function () {
            var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
            var deltaY = 0;
            if (this.button.isDown)
                deltaY = -0.30;
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v);
        };
        Slider.prototype.getButtonColor = function () {
            var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
            var deltaY = 0;
            if (this.button.isDown)
                deltaY = -0.30;
            else if (this.button.hasFocus)
                deltaY = 0.10;
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v);
        };
        Slider.prototype.updateColors = function () {
            this.bar.fill = this.getForeground();
            this.background.fill = this.getBackground();
            this.buttonContent.fill = this.getForeground();
        };
        Slider.prototype.measureCore = function (width, height) {
            var buttonSize = this.button.measure(0, 0);
            var size = buttonSize;
            var res;
            if (this.orientation === 'horizontal') {
                res = this.background.measure(width - buttonSize.width, 0);
                if (res.width > size.width)
                    size.width = res.width;
                if (res.height > size.height)
                    size.height = res.height;
                res = this.bar.measure(width - buttonSize.width, 0);
                if (res.width > size.width)
                    size.width = res.width;
                if (res.height > size.height)
                    size.height = res.height;
            }
            else {
                res = this.background.measure(0, height - buttonSize.height);
                if (res.width > size.width)
                    size.width = res.width;
                if (res.height > size.height)
                    size.height = res.height;
                res = this.bar.measure(0, height - buttonSize.height);
                if (res.width > size.width)
                    size.width = res.width;
                if (res.height > size.height)
                    size.height = res.height;
            }
            return size;
        };
        Slider.prototype.arrangeCore = function (width, height) {
            if (this.orientation === 'horizontal') {
                this.button.arrange(0, (height - this.button.measureHeight) / 2, this.button.measureWidth, this.button.measureHeight);
                this.background.arrange(this.button.layoutWidth / 2, (height - this.background.measureHeight) / 2, width - this.button.layoutWidth, this.background.measureHeight);
            }
            else {
                this.button.arrange((width - this.button.measureWidth) / 2, 0, this.button.measureWidth, this.button.measureHeight);
                this.background.arrange((width - this.background.measureWidth) / 2, this.button.layoutHeight / 2, this.background.measureWidth, height - this.button.layoutHeight);
            }
            this.updateValue();
        };
        Slider.prototype.onStyleChange = function () {
            this.background.radius = this.getStyleProperty('radius');
            this.bar.radius = this.getStyleProperty('radius');
            this.updateColors();
        };
        Slider.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.button.opacity = 0.2;
        };
        Slider.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.button.opacity = 1;
        };
        Slider.style = {
            radius: 0,
            background: '#e1e1e1',
            backgroundBorder: '#919191',
            foreground: '#07a0e5'
        };
        return Slider;
    }(Ui.Container));
    Ui.Slider = Slider;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Audio = (function (_super) {
        __extends(Audio, _super);
        function Audio(init) {
            var _this = _super.call(this) || this;
            _this.canplaythrough = false;
            _this._state = 'initial';
            _this.addEvents('ready', 'ended', 'timeupdate', 'bufferingupdate', 'statechange', 'error');
            _this.connect(_this, 'unload', _this.onAudioUnload);
            _this.verticalAlign = 'top';
            _this.horizontalAlign = 'left';
            if (init) {
                if (init.oggSrc || init.mp3Src || init.aacSrc) {
                    if (init.oggSrc && Ui.Audio.supportOgg)
                        _this.src = init.oggSrc;
                    else if (init.mp3Src && Ui.Audio.supportMp3)
                        _this.src = init.mp3Src;
                    else if (init.aacSrc && Ui.Audio.supportAac)
                        _this.src = init.aacSrc;
                }
                _this.assign(init);
            }
            return _this;
        }
        Object.defineProperty(Audio.prototype, "src", {
            set: function (src) {
                this.canplaythrough = false;
                this._state = 'initial';
                this._src = src;
                this.audioDrawing.setAttribute('src', src);
                try {
                    this.audioDrawing.load();
                }
                catch (e) { }
            },
            enumerable: true,
            configurable: true
        });
        Audio.prototype.play = function () {
            this._state = 'playing';
            this.fireEvent('statechange', this, this._state);
            if (this.canplaythrough)
                this.audioDrawing.play();
            else
                this.audioDrawing.load();
        };
        Audio.prototype.pause = function () {
            this._state = 'paused';
            this.fireEvent('statechange', this, this._state);
            if (this.canplaythrough)
                this.audioDrawing.pause();
            else
                this.audioDrawing.load();
        };
        Audio.prototype.stop = function () {
            this.audioDrawing.pause();
            this.onEnded();
        };
        Object.defineProperty(Audio.prototype, "volume", {
            get: function () {
                return this.audioDrawing.volume;
            },
            set: function (volume) {
                this.audioDrawing.volume = volume;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "duration", {
            get: function () {
                var duration = this.audioDrawing.duration;
                if ((duration === undefined) || isNaN(duration) || (duration === null))
                    return undefined;
                else
                    return duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "currentTime", {
            get: function () {
                if (this.audioDrawing.currentTime === undefined)
                    return 0;
                else
                    return this.audioDrawing.currentTime;
            },
            set: function (time) {
                this.audioDrawing.currentTime = time;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "isReady", {
            get: function () {
                return this.canplaythrough;
            },
            enumerable: true,
            configurable: true
        });
        Audio.prototype.onReady = function () {
            this.canplaythrough = true;
            if (this._state == 'playing')
                this.audioDrawing.play();
            else if (this._state == 'paused')
                this.audioDrawing.pause();
            this.fireEvent('ready');
        };
        Audio.prototype.onTimeUpdate = function () {
            this.fireEvent('timeupdate', this, this.audioDrawing.currentTime);
            this.checkBuffering();
        };
        Audio.prototype.onEnded = function () {
            this.audioDrawing.pause();
            this._state = 'initial';
            this.audioDrawing.currentTime = 0;
            this.fireEvent('ended', this);
            this.fireEvent('statechange', this, this._state);
        };
        Audio.prototype.onProgress = function () {
            this.checkBuffering();
        };
        Object.defineProperty(Audio.prototype, "currentBufferSize", {
            get: function () {
                var buffered = this.audioDrawing.buffered;
                var timebuffer = 0;
                var time = this.audioDrawing.currentTime;
                if (time === undefined)
                    time = 0;
                var lastEnd;
                for (var i = 0; i < buffered.length; i++) {
                    var start = buffered.start(i);
                    var end = buffered.end(i);
                    if (lastEnd === undefined) {
                        if ((start <= time) && (end >= time)) {
                            timebuffer = end - time;
                            lastEnd = end;
                        }
                    }
                    else {
                        if ((lastEnd >= (start - 0.01)) && (lastEnd <= end)) {
                            timebuffer += (end - lastEnd);
                            lastEnd = end;
                        }
                    }
                }
                return timebuffer;
            },
            enumerable: true,
            configurable: true
        });
        Audio.prototype.checkBuffering = function () {
            var timebuffer = this.currentBufferSize;
            var time = this.audioDrawing.currentTime;
            var duration = this.audioDrawing.duration;
            this.fireEvent('bufferingupdate', this, timebuffer);
        };
        Audio.prototype.onError = function () {
            this._state = 'error';
            this.fireEvent('error', this, this.audioDrawing.error.code);
            this.fireEvent('statechange', this, this._state);
        };
        Audio.prototype.onWaiting = function () {
            if (!this.canplaythrough)
                this.audioDrawing.load();
        };
        Audio.prototype.onAudioUnload = function () {
            if (this.canplaythrough)
                this.pause();
            this.audioDrawing.removeAttribute('src');
            try {
                this.audioDrawing.load();
            }
            catch (e) { }
        };
        Audio.prototype.renderDrawing = function () {
            var drawing;
            if (Ui.Audio.htmlAudio) {
                this.audioDrawing = document.createElement('audio');
                this.audioDrawing.style.display = 'none';
                this.connect(this.audioDrawing, 'canplaythrough', this.onReady);
                this.connect(this.audioDrawing, 'ended', this.onEnded);
                this.connect(this.audioDrawing, 'timeupdate', this.onTimeUpdate);
                this.connect(this.audioDrawing, 'error', this.onError);
                this.connect(this.audioDrawing, 'progress', this.onProgress);
                this.connect(this.audioDrawing, 'waiting', this.onWaiting);
                this.audioDrawing.setAttribute('preload', 'auto');
                this.audioDrawing.load();
                drawing = this.audioDrawing;
            }
            else {
                drawing = _super.prototype.renderDrawing.call(this);
            }
            return drawing;
        };
        Audio.initialize = function () {
            var audioTest = document.createElement('audio');
            if (audioTest.play !== undefined) {
                this.htmlAudio = true;
                this.supportWav = !!audioTest.canPlayType && '' !== audioTest.canPlayType('audio/wav');
                this.supportMp3 = !!audioTest.canPlayType && '' !== audioTest.canPlayType('audio/mpeg');
                this.supportOgg = !!audioTest.canPlayType && '' !== audioTest.canPlayType('audio/ogg; codecs="vorbis"');
                this.supportAac = !!audioTest.canPlayType && '' !== audioTest.canPlayType('audio/mp4; codecs="mp4a.40.2"');
            }
        };
        Audio.htmlAudio = false;
        Audio.supportOgg = false;
        Audio.supportMp3 = false;
        Audio.supportWav = false;
        Audio.supportAac = false;
        return Audio;
    }(Ui.Element));
    Ui.Audio = Audio;
})(Ui || (Ui = {}));
Ui.Audio.initialize();
var Ui;
(function (Ui) {
    var LinkButton = (function (_super) {
        __extends(LinkButton, _super);
        function LinkButton(init) {
            var _this = _super.call(this) || this;
            _this.openWindow = true;
            _this.addEvents('link');
            _this.connect(_this, 'press', _this.onLinkButtonPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        LinkButton.prototype.onLinkButtonPress = function () {
            this.fireEvent('link', this);
            if (this.openWindow)
                window.open(this.src, this.target);
            else
                window.location.replace(this.src);
        };
        LinkButton.style = {
            background: '#a4f4f4'
        };
        return LinkButton;
    }(Ui.Button));
    Ui.LinkButton = LinkButton;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var SFlowState = (function (_super) {
        __extends(SFlowState, _super);
        function SFlowState(config) {
            var _this = _super.call(this) || this;
            _this.x = 0;
            _this.y = 0;
            _this.width = 0;
            _this.height = 0;
            _this.xpos = 0;
            _this.ypos = 0;
            _this.lineHeight = 0;
            _this.drawCount = 0;
            _this.drawWidth = 0;
            _this.drawSpaceWidth = 0;
            _this.render = false;
            _this.spacing = 0;
            _this.align = 'left';
            _this.stretchMaxRatio = 1.7;
            _this.uniform = false;
            _this.firstLine = true;
            _this.lastLine = false;
            _this.width = config.width;
            delete (config.width);
            _this.render = config.render;
            delete (config.render);
            if ('spacing' in config) {
                _this.spacing = config.spacing;
                delete (config.spacing);
            }
            if ('align' in config) {
                _this.align = config.align;
                delete (config.align);
            }
            if ('uniform' in config) {
                _this.uniform = config.uniform;
                delete (config.uniform);
            }
            if ('uniformWidth' in config) {
                _this.uniformWidth = config.uniformWidth;
                _this.stretchUniformWidth = _this.uniformWidth;
                delete (config.uniformWidth);
            }
            if ('uniformHeight' in config) {
                _this.uniformHeight = config.uniformHeight;
                delete (config.uniformHeight);
            }
            if ('stretchMaxRatio' in config) {
                _this.stretchMaxRatio = config.stretchMaxRatio;
                delete (config.stretchMaxRatio);
            }
            _this.zones = [{ xstart: 0, xend: _this.width }];
            _this.currentZone = 0;
            _this.boxes = [];
            _this.drawCmd = [];
            return _this;
        }
        SFlowState.prototype.getSize = function () {
            this.lastLine = true;
            this.flush();
            return { width: this.width, height: this.ypos };
        };
        SFlowState.prototype.append = function (el) {
            var zone;
            var isstart;
            var isstartline;
            var isendline;
            var flushVal = SFlow.getFlush(el);
            if (flushVal === 'flush')
                this.flush();
            else if (flushVal === 'flushleft')
                this.flushLeft();
            else if (flushVal === 'flushright')
                this.flushRight();
            else if (flushVal === 'newline')
                this.nextLine();
            var floatVal = SFlow.getFloat(el);
            if (floatVal === 'none') {
                var size;
                if (this.uniform) {
                    size = el.measure(this.uniformWidth, this.uniformHeight);
                    size = { width: this.uniformWidth, height: this.uniformHeight };
                }
                else
                    size = el.measure(this.width, 0);
                while (true) {
                    zone = this.zones[this.currentZone];
                    isstart = false;
                    if (zone.xstart === this.xpos)
                        isstart = true;
                    if ((this.xpos + size.width + ((isstart) ? 0 : this.spacing) <= zone.xend) ||
                        (isstart && (zone.xend === this.width) && (size.width >= this.width))) {
                        this.pushDraw({ width: size.width, height: size.height, spaceWidth: isstart ? 0 : this.spacing, el: el });
                        if (!isstart)
                            this.xpos += this.spacing;
                        this.xpos += size.width;
                        if (size.height > this.lineHeight) {
                            this.lineHeight = size.height;
                        }
                        break;
                    }
                    else {
                        this.nextZone();
                    }
                }
            }
            else if (floatVal === 'left') {
                var size = el.measure(this.width, 0);
                while (true) {
                    zone = this.zones[this.currentZone];
                    isstartline = false;
                    if (this.xpos === 0)
                        isstartline = true;
                    if (isstartline && (size.width <= zone.xend - this.xpos)) {
                        if (this.render)
                            el.arrange(this.xpos, this.ypos, size.width, size.height);
                        this.insertBox({ x: this.xpos, y: this.ypos, width: size.width, height: size.height });
                        break;
                    }
                    else
                        this.nextZone();
                }
            }
            else if (floatVal === 'right') {
                var size = el.measure(this.width, 0);
                while (true) {
                    zone = this.zones[this.currentZone];
                    isendline = false;
                    if (this.width == zone.xend)
                        isendline = true;
                    if (isendline && (size.width <= zone.xend - this.xpos)) {
                        if (this.render)
                            el.arrange(zone.xend - size.width, this.ypos, size.width, size.height);
                        this.insertBox({ x: zone.xend - size.width, y: this.ypos, width: size.width, height: size.height });
                        break;
                    }
                    else
                        this.nextZone();
                }
            }
        };
        SFlowState.prototype.flushDraw = function () {
            if (this.render && (this.drawCmd.length > 0)) {
                var zone = this.zones[this.currentZone];
                var xpos = zone.xstart;
                var widthBonus = 0;
                var itemWidth = 0;
                if (this.align === 'right')
                    xpos += (zone.xend - zone.xstart) - (this.drawWidth + this.drawSpaceWidth);
                else if (this.align === 'center')
                    xpos += Math.floor(((zone.xend - zone.xstart) - (this.drawWidth + this.drawSpaceWidth)) / 2);
                else if (this.align === 'stretch')
                    widthBonus = Math.floor(((zone.xend - zone.xstart) - (this.drawWidth + this.drawSpaceWidth)) / this.drawCmd.length);
                for (var i = 0; i < this.drawCmd.length; i++) {
                    var cmd = this.drawCmd[i];
                    if (cmd.width + widthBonus > cmd.width * this.stretchMaxRatio)
                        itemWidth = cmd.width * this.stretchMaxRatio;
                    else
                        itemWidth = cmd.width + widthBonus;
                    if (this.uniform && (this.align === 'stretch')) {
                        if (this.lastLine && !this.firstLine)
                            itemWidth = Math.max(cmd.width, this.stretchUniformWidth);
                        else
                            this.stretchUniformWidth = itemWidth;
                    }
                    cmd.el.arrange(xpos + cmd.spaceWidth, this.ypos, itemWidth, this.lineHeight);
                    xpos += itemWidth + cmd.spaceWidth;
                }
            }
            this.drawCmd = [];
            this.drawWidth = 0;
            this.drawCount = 0;
            this.drawSpaceWidth = 0;
        };
        SFlowState.prototype.pushDraw = function (cmd) {
            this.drawCmd.push(cmd);
            this.drawCount++;
            this.drawWidth += cmd.width;
            this.drawSpaceWidth += cmd.spaceWidth;
        };
        SFlowState.prototype.insertBox = function (box) {
            this.boxes.push(box);
            this.calculZone();
        };
        SFlowState.prototype.calculZone = function () {
            var zone;
            this.zones = [{ xstart: 0, xend: this.width }];
            for (var i2 = 0; i2 < this.boxes.length; i2++) {
                var box = this.boxes[i2];
                if ((this.ypos + this.lineHeight < box.y) || (this.ypos >= box.y + box.height)) {
                    continue;
                }
                var tmpZones = [];
                for (var i = 0; i < this.zones.length; i++) {
                    zone = this.zones[i];
                    if ((box.x <= zone.xstart) && (box.x + box.width < zone.xend))
                        tmpZones.push({ xstart: box.x + box.width, xend: zone.xend });
                    else if ((box.x < zone.xend) && (box.x + box.width >= zone.xend))
                        tmpZones.push({ xstart: zone.xstart, xend: box.x });
                    else if ((box.x > zone.xstart) && (box.x + box.width < zone.xend)) {
                        tmpZones.push({ xstart: zone.xstart, xend: box.x });
                        tmpZones.push({ xstart: box.x + box.width, xend: zone.xend });
                    }
                    else if ((box.x <= zone.xstart) && (box.x + box.width >= zone.xend)) {
                    }
                    else {
                        tmpZones.push({ xstart: zone.xstart, xend: zone.xend });
                    }
                }
                this.zones = tmpZones;
            }
            for (this.currentZone = 0; this.currentZone < this.zones.length; this.currentZone++) {
                zone = this.zones[this.currentZone];
                if ((this.xpos >= zone.xstart) && (this.xpos <= zone.xend)) {
                    break;
                }
            }
            if (this.currentZone >= this.zones.length) {
                this.currentZone = -1;
                for (this.currentZone = 0; this.currentZone < this.zones.length; this.currentZone++) {
                    zone = this.zones[this.currentZone];
                    if (zone.xstart >= this.xpos) {
                        this.xpos = zone.xstart;
                        break;
                    }
                }
                if (this.currentZone >= this.zones.length) {
                    this.xpos = 0;
                    this.nextLine();
                }
            }
        };
        SFlowState.prototype.flush = function () {
            if (this.drawCount !== 0)
                this.nextLine();
            while (true) {
                var zone = this.zones[this.currentZone];
                if ((zone.xstart === 0) && (zone.xend === this.width))
                    break;
                else
                    this.nextZone();
            }
        };
        SFlowState.prototype.flushLeft = function () {
            if (this.drawCount !== 0)
                this.nextLine();
            while (true) {
                var zone = this.zones[this.currentZone];
                if (zone.xstart === 0)
                    break;
                else
                    this.nextZone();
            }
        };
        SFlowState.prototype.flushRight = function () {
            if (this.drawCount !== 0)
                this.nextLine();
            while (true) {
                var zone = this.zones[this.currentZone];
                if (zone.xend === this.width)
                    break;
                else
                    this.nextZone();
            }
        };
        SFlowState.prototype.nextLine = function () {
            this.flushDraw();
            do {
                if (this.lineHeight > 0) {
                    this.ypos += this.lineHeight + this.spacing;
                    this.lineHeight = 0;
                    this.calculZone();
                }
                else if (this.boxes.length > 0) {
                    var nexty = Number.MAX_VALUE;
                    for (var i = 0; i < this.boxes.length; i++) {
                        var box = this.boxes[i];
                        if ((this.ypos < box.y + box.height) && (nexty > box.y + box.height))
                            nexty = box.y + box.height;
                    }
                    if (nexty !== Number.MAX_VALUE)
                        this.ypos = nexty + this.spacing;
                    this.calculZone();
                }
            } while (this.zones.length === 0);
            this.currentZone = 0;
            this.xpos = this.zones[0].xstart;
            this.firstLine = false;
        };
        SFlowState.prototype.nextZone = function () {
            this.flushDraw();
            if (this.currentZone >= this.zones.length - 1) {
                this.nextLine();
            }
            else {
                this.currentZone++;
                this.xpos = this.zones[this.currentZone].xstart;
            }
        };
        return SFlowState;
    }(Core.Object));
    var SFlow = (function (_super) {
        __extends(SFlow, _super);
        function SFlow(init) {
            var _this = _super.call(this) || this;
            _this._uniform = false;
            _this._itemAlign = 'left';
            _this._stretchMaxRatio = 1.3;
            _this._spacing = 0;
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(SFlow.prototype, "content", {
            set: function (content) {
                while (this.firstChild !== undefined)
                    this.removeChild(this.firstChild);
                if ((content != undefined) && (typeof (content) === 'object')) {
                    for (var i = 0; i < content.length; i++)
                        this.appendChild(content[i]);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlow.prototype, "spacing", {
            get: function () {
                return this._spacing;
            },
            set: function (spacing) {
                if (this._spacing != spacing) {
                    this._spacing = spacing;
                    this.invalidateMeasure();
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlow.prototype, "itemAlign", {
            get: function () {
                return this._itemAlign;
            },
            set: function (itemAlign) {
                if (itemAlign != this._itemAlign) {
                    this._itemAlign = itemAlign;
                    this.invalidateMeasure();
                    this.invalidateArrange();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlow.prototype, "uniform", {
            get: function () {
                return this._uniform;
            },
            set: function (uniform) {
                if (this._uniform != uniform) {
                    this._uniform = uniform;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlow.prototype, "uniformRatio", {
            get: function () {
                return this._uniformRatio;
            },
            set: function (uniformRatio) {
                if (this._uniformRatio != uniformRatio) {
                    this._uniformRatio = uniformRatio;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlow.prototype, "stretchMaxRatio", {
            get: function () {
                return this._stretchMaxRatio;
            },
            set: function (stretchMaxRatio) {
                if (this._stretchMaxRatio != stretchMaxRatio) {
                    this._stretchMaxRatio = stretchMaxRatio;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        SFlow.prototype.append = function (child, floatVal, flushVal) {
            this.appendChild(child);
            if (floatVal !== undefined)
                SFlow.setFloat(child, floatVal);
            if (flushVal !== undefined)
                SFlow.setFlush(child, flushVal);
        };
        SFlow.prototype.prepend = function (child, floatVal, flushVal) {
            this.prependChild(child);
            if (floatVal !== undefined)
                SFlow.setFloat(child, floatVal);
            if (flushVal !== undefined)
                SFlow.setFlush(child, flushVal);
        };
        SFlow.prototype.insertAt = function (child, position, floatVal, flushVal) {
            this.insertChildAt(child, position);
            if (floatVal !== undefined)
                SFlow.setFloat(child, floatVal);
            if (flushVal !== undefined)
                SFlow.setFlush(child, flushVal);
        };
        SFlow.prototype.moveAt = function (child, position) {
            this.moveChildAt(child, position);
        };
        SFlow.prototype.remove = function (child) {
            this.removeChild(child);
        };
        SFlow.prototype.measureCore = function (width, height) {
            if (this.children.length === 0)
                return { width: 0, height: 0 };
            if (this._uniform) {
                this._uniformWidth = 0;
                this._uniformHeight = 0;
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    var childSize = child.measure(width, height);
                    if (childSize.width > this._uniformWidth)
                        this._uniformWidth = childSize.width;
                    if (childSize.height > this._uniformHeight)
                        this._uniformHeight = childSize.height;
                }
                if (this._uniformRatio !== undefined) {
                    var aratio = this._uniformWidth / this._uniformHeight;
                    var aw, ah;
                    if (this._uniformRatio < aratio) {
                        aw = this._uniformWidth;
                        ah = aw / this._uniformRatio;
                    }
                    else {
                        ah = this._uniformHeight;
                        aw = ah * this._uniformRatio;
                    }
                    this._uniformWidth = aw;
                    this._uniformHeight = ah;
                }
            }
            var state = new SFlowState({
                width: width, render: false, spacing: this._spacing,
                align: this.itemAlign, uniform: this._uniform,
                uniformWidth: this._uniformWidth, uniformHeight: this._uniformHeight,
                stretchMaxRatio: this._stretchMaxRatio
            });
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                state.append(child);
            }
            return state.getSize();
        };
        SFlow.prototype.arrangeCore = function (width, height) {
            var state = new SFlowState({
                width: width, render: true, spacing: this._spacing,
                align: this.itemAlign, uniform: this._uniform,
                uniformWidth: this._uniformWidth, uniformHeight: this._uniformHeight,
                stretchMaxRatio: this._stretchMaxRatio
            });
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                state.append(child);
            }
            state.getSize();
        };
        SFlow.getFloat = function (child) {
            return child['Ui.SFlow.float'] ? child['Ui.SFlow.float'] : 'none';
        };
        SFlow.setFloat = function (child, floatVal) {
            if (SFlow.getFloat(child) !== floatVal) {
                child['Ui.SFlow.float'] = floatVal;
                child.invalidateMeasure();
            }
        };
        SFlow.getFlush = function (child) {
            return child['Ui.SFlow.flush'] ? child['Ui.SFlow.flush'] : 'none';
        };
        SFlow.setFlush = function (child, flushVal) {
            if (SFlow.getFlush(child) !== flushVal) {
                child['Ui.SFlow.flush'] = flushVal;
                child.invalidateMeasure();
            }
        };
        return SFlow;
    }(Ui.Container));
    Ui.SFlow = SFlow;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Video = (function (_super) {
        __extends(Video, _super);
        function Video(init) {
            var _this = _super.call(this) || this;
            _this.loaddone = false;
            _this.canplaythrough = false;
            _this._state = 'initial';
            _this.addEvents('ready', 'ended', 'timeupdate', 'bufferingupdate', 'statechange', 'error');
            _this.connect(_this, 'unload', _this.onVideoUnload);
            if (init) {
                if (init.oggSrc || init.mp4Src || init.webmSrc) {
                    if (init.oggSrc && Ui.Video.supportOgg)
                        _this.src = init.oggSrc;
                    else if (init.mp4Src && Ui.Video.supportMp4)
                        _this.src = init.mp4Src;
                    else if (init.webmSrc && Ui.Video.supportWebm)
                        _this.src = init.webmSrc;
                }
                _this.assign(init);
            }
            return _this;
        }
        Object.defineProperty(Video.prototype, "src", {
            set: function (src) {
                this.canplaythrough = false;
                this._state = 'initial';
                if (typeof (src) === 'object')
                    this.videoDrawing.src = URL.createObjectURL(src);
                else
                    this.videoDrawing.setAttribute('src', src);
                try {
                    this.videoDrawing.load();
                }
                catch (e) { }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "poster", {
            set: function (src) {
                this.videoDrawing.setAttribute('poster', src);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "autoplay", {
            set: function (autoplay) {
                this.videoDrawing.autoplay = autoplay;
            },
            enumerable: true,
            configurable: true
        });
        Video.prototype.play = function () {
            this._state = 'playing';
            this.fireEvent('statechange', this, this._state);
            if (this.canplaythrough)
                this.videoDrawing.play();
            else
                this.videoDrawing.load();
        };
        Video.prototype.pause = function () {
            this._state = 'paused';
            this.fireEvent('statechange', this, this._state);
            if (this.canplaythrough)
                this.videoDrawing.pause();
            else
                this.videoDrawing.load();
        };
        Video.prototype.stop = function () {
            this.videoDrawing.pause();
            this.onEnded();
        };
        Object.defineProperty(Video.prototype, "volume", {
            get: function () {
                return this.videoDrawing.volume;
            },
            set: function (volume) {
                this.videoDrawing.volume = volume;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "duration", {
            get: function () {
                return this.videoDrawing.duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "currentTime", {
            get: function () {
                if (this.videoDrawing.currentTime === undefined)
                    return 0;
                else
                    return this.videoDrawing.currentTime;
            },
            set: function (time) {
                this.videoDrawing.currentTime = time;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "isReady", {
            get: function () {
                return this.canplaythrough;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "naturalWidth", {
            get: function () {
                return this.videoDrawing.videoWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "naturalHeight", {
            get: function () {
                return this.videoDrawing.videoHeight;
            },
            enumerable: true,
            configurable: true
        });
        Video.prototype.onReady = function () {
            this.canplaythrough = true;
            this.videoDrawing.videoWidth;
            this.videoDrawing.videoHeight;
            if (this._state == 'playing')
                this.videoDrawing.play();
            else if (this._state == 'paused')
                this.videoDrawing.pause();
            this.fireEvent('ready');
        };
        Video.prototype.onTimeUpdate = function () {
            this.fireEvent('timeupdate', this, this.videoDrawing.currentTime);
            this.checkBuffering();
        };
        Video.prototype.onEnded = function () {
            this.videoDrawing.pause();
            this._state = 'initial';
            this.videoDrawing.currentTime = 0;
            this.fireEvent('ended', this);
            this.fireEvent('statechange', this, this._state);
        };
        Video.prototype.onProgress = function () {
            this.checkBuffering();
        };
        Object.defineProperty(Video.prototype, "currentBufferSize", {
            get: function () {
                var buffered = this.videoDrawing.buffered;
                var timebuffer = 0;
                var time = this.videoDrawing.currentTime;
                if (time === undefined)
                    time = 0;
                var lastEnd;
                for (var i = 0; i < buffered.length; i++) {
                    var start = buffered.start(i);
                    var end = buffered.end(i);
                    if (lastEnd === undefined) {
                        if ((start <= time) && (end >= time)) {
                            timebuffer = end - time;
                            lastEnd = end;
                        }
                    }
                    else {
                        if ((lastEnd >= (start - 0.01)) && (lastEnd <= end)) {
                            timebuffer += (end - lastEnd);
                            lastEnd = end;
                        }
                    }
                }
                return timebuffer;
            },
            enumerable: true,
            configurable: true
        });
        Video.prototype.checkBuffering = function () {
            var timebuffer = this.currentBufferSize;
            var time = this.videoDrawing.currentTime;
            var duration = this.videoDrawing.duration;
            this.fireEvent('bufferingupdate', this, timebuffer);
        };
        Video.prototype.onError = function () {
            this._state = 'error';
            this.fireEvent('error', this, this.videoDrawing.error.code);
            this.fireEvent('statechange', this, this._state);
        };
        Video.prototype.onWaiting = function () {
            if (!this.canplaythrough)
                this.videoDrawing.load();
        };
        Video.prototype.onVideoUnload = function () {
            if (this.canplaythrough)
                this.pause();
            this.videoDrawing.removeAttribute('src');
            try {
                this.videoDrawing.load();
            }
            catch (e) { }
        };
        Video.prototype.renderDrawing = function () {
            if (Ui.Video.htmlVideo) {
                this.videoDrawing = document.createElement('video');
                this.connect(this.videoDrawing, 'canplaythrough', this.onReady);
                this.connect(this.videoDrawing, 'ended', this.onEnded);
                this.connect(this.videoDrawing, 'timeupdate', this.onTimeUpdate);
                this.connect(this.videoDrawing, 'error', this.onError);
                this.connect(this.videoDrawing, 'progress', this.onProgress);
                this.connect(this.videoDrawing, 'waiting', this.onWaiting);
                this.videoDrawing.setAttribute('preload', 'auto');
                this.videoDrawing.load();
                this.videoDrawing.style.position = 'absolute';
                this.videoDrawing.style.left = '0px';
                this.videoDrawing.style.top = '0px';
            }
            return this.videoDrawing;
        };
        Video.prototype.arrangeCore = function (width, height) {
            if (Ui.Video.htmlVideo) {
                this.videoDrawing.setAttribute('width', width.toString());
                this.videoDrawing.setAttribute('height', height.toString());
            }
        };
        Video.initialize = function () {
            var videoTest = document.createElement('video');
            if (videoTest.play !== undefined) {
                this.htmlVideo = true;
                this.supportMp4 = !!videoTest.canPlayType && '' !== videoTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
                this.supportOgg = !!videoTest.canPlayType && '' !== videoTest.canPlayType('video/ogg; codecs="theora, vorbis"');
                this.supportWebm = !!videoTest.canPlayType && '' !== videoTest.canPlayType('video/webm; codecs="vp8, vorbis"');
            }
        };
        Video.htmlVideo = false;
        Video.flashVideo = false;
        Video.supportOgg = false;
        Video.supportMp4 = false;
        Video.supportWebm = false;
        return Video;
    }(Ui.Element));
    Ui.Video = Video;
})(Ui || (Ui = {}));
Ui.Video.initialize();
var Ui;
(function (Ui) {
    var MonthCalendar = (function (_super) {
        __extends(MonthCalendar, _super);
        function MonthCalendar(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('dayselect');
            _this._date = new Date();
            var hbox = new Ui.HBox();
            _this.append(hbox);
            var button = new Ui.Pressable({ verticalAlign: 'center' });
            _this.leftarrow = new Ui.Icon({ icon: 'arrowleft', width: 24, height: 24 });
            button.append(_this.leftarrow);
            hbox.append(button);
            _this.connect(button, 'press', _this.onLeftButtonPress);
            _this.title = new Ui.Label({ fontWeight: 'bold', fontSize: 18, margin: 5 });
            hbox.append(_this.title, true);
            button = new Ui.Pressable({ verticalAlign: 'center' });
            _this.rightarrow = new Ui.Icon({ icon: 'arrowright', width: 24, height: 24 });
            button.append(_this.rightarrow);
            hbox.append(button);
            _this.connect(button, 'press', _this.onRightButtonPress);
            _this.grid = new Ui.Grid({
                cols: 'auto,auto,auto,auto,auto,auto,auto',
                rows: 'auto,auto,auto,auto,auto,auto,auto',
                horizontalAlign: 'center'
            });
            _this.append(_this.grid);
            _this.updateDate();
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(MonthCalendar.prototype, "dayFilter", {
            set: function (dayFilter) {
                this._dayFilter = dayFilter;
                this.updateDate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MonthCalendar.prototype, "dateFilter", {
            set: function (dateFilter) {
                this._dateFilter = dateFilter;
                this.updateDate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MonthCalendar.prototype, "date", {
            set: function (date) {
                this._date = date;
                this.updateDate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MonthCalendar.prototype, "selectedDate", {
            get: function () {
                return this._selectedDate;
            },
            set: function (selectedDate) {
                this._selectedDate = selectedDate;
                this.updateDate();
            },
            enumerable: true,
            configurable: true
        });
        MonthCalendar.prototype.onLeftButtonPress = function () {
            this._date.setMonth(this._date.getMonth() - 1);
            this.updateDate();
        };
        MonthCalendar.prototype.onRightButtonPress = function () {
            this._date.setMonth(this._date.getMonth() + 1);
            this.updateDate();
        };
        MonthCalendar.prototype.onDaySelect = function (button) {
            this._selectedDate = button.monthCalendarDate;
            this.updateDate();
            this.fireEvent('dayselect', this, this._selectedDate);
        };
        MonthCalendar.prototype.updateDate = function () {
            var i;
            var dayPivot = [6, 0, 1, 2, 3, 4, 5];
            var dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
            var monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            this.title.text = monthNames[this._date.getMonth()] + ' ' + this._date.getFullYear();
            while (this.grid.firstChild !== undefined)
                this.grid.detach(this.grid.firstChild);
            for (i = 0; i < 7; i++)
                this.grid.attach(new Ui.Label({ text: dayNames[i], fontWeight: 'bold', margin: 5 }), i, 0);
            var month = this._date.getMonth();
            var current = new Date(this._date.getTime());
            current.setDate(1);
            var row = 1;
            var now = new Date();
            do {
                var day = new DayButton();
                day.monthCalendarDate = current;
                this.connect(day, 'press', this.onDaySelect);
                var bg = void 0;
                if ((current.getFullYear() == now.getFullYear()) && (current.getMonth() == now.getMonth()) && (current.getDate() == now.getDate())) {
                    day.monthCalendarCurrent = true;
                    bg = new Ui.Rectangle({ fill: new Ui.Color(0.2, 0.4, 1, 0.4), margin: 1 });
                    day.append(bg);
                }
                else {
                    bg = new Ui.Rectangle({ fill: new Ui.Color(0.8, 0.8, 0.8, 0.4), margin: 1 });
                    day.append(bg);
                }
                if ((this._selectedDate !== undefined) && (current.getFullYear() === this._selectedDate.getFullYear()) && (current.getMonth() === this._selectedDate.getMonth()) && (current.getDate() === this.selectedDate.getDate()))
                    day.append(new Ui.Frame({ frameWidth: 3, fill: 'red', radius: 0 }));
                var disable = false;
                if (this._dayFilter !== undefined) {
                    var weekday = current.getDay();
                    for (i = 0; (i < this._dayFilter.length) && !disable; i++)
                        if (weekday == this._dayFilter[i])
                            disable = true;
                }
                if (this._dateFilter !== undefined) {
                    var daystr = current.getFullYear() + '/';
                    if (current.getMonth() + 1 < 10)
                        daystr += '0';
                    daystr += (current.getMonth() + 1) + '/';
                    if (current.getDate() < 10)
                        daystr += '0';
                    daystr += current.getDate();
                    for (i = 0; (i < this._dateFilter.length) && !disable; i++) {
                        var re = new RegExp(this._dateFilter[i]);
                        if (re.test(daystr)) {
                            disable = true;
                        }
                    }
                }
                if (disable) {
                    day.disable();
                    day.opacity = 0.2;
                }
                day.append(new Ui.Label({ text: current.getDate().toString(), margin: 5 }));
                this.grid.attach(day, dayPivot[current.getDay()], row);
                current = new Date(current.getTime() + 1000 * 60 * 60 * 24);
                if (dayPivot[current.getDay()] === 0)
                    row++;
            } while (month == current.getMonth());
            this.onStyleChange();
        };
        MonthCalendar.prototype.onStyleChange = function () {
            var color = this.getStyleProperty('color');
            var dayColor = this.getStyleProperty('dayColor');
            var currentDayColor = this.getStyleProperty('currentDayColor');
            this.title.color = color;
            this.leftarrow.fill = color;
            this.rightarrow.fill = color;
            for (var i = 0; i < this.grid.children.length; i++) {
                var child = this.grid.children[i];
                if (child instanceof Ui.Label)
                    child.color = color;
                else if (child instanceof DayButton) {
                    for (var i2 = 0; i2 < child.children.length; i2++) {
                        var child2 = child.children[i2];
                        if (child2 instanceof Ui.Label)
                            child2.color = color;
                        else if (child2 instanceof Ui.Rectangle) {
                            if (child.monthCalendarCurrent)
                                child2.fill = currentDayColor;
                            else
                                child2.fill = dayColor;
                        }
                    }
                }
            }
        };
        MonthCalendar.style = {
            color: 'black',
            dayColor: new Ui.Color(0.81, 0.81, 0.81, 0.5),
            currentDayColor: new Ui.Color(1, 0.31, 0.66, 0.5)
        };
        return MonthCalendar;
    }(Ui.VBox));
    Ui.MonthCalendar = MonthCalendar;
    var DayButton = (function (_super) {
        __extends(DayButton, _super);
        function DayButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return DayButton;
    }(Ui.Pressable));
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var TextFieldButton = (function (_super) {
        __extends(TextFieldButton, _super);
        function TextFieldButton() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.style = {
                padding: 6,
                iconSize: 22,
                background: 'rgba(250,250,250,0)',
                backgroundBorder: 'rgba(140,140,140,0)'
            };
            return _this;
        }
        return TextFieldButton;
    }(Ui.Button));
    Ui.TextFieldButton = TextFieldButton;
    var TextButtonField = (function (_super) {
        __extends(TextButtonField, _super);
        function TextButtonField(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('change', 'validate', 'buttonpress');
            _this.padding = 3;
            _this.graphic = new Ui.TextBgGraphic();
            _this.append(_this.graphic);
            _this._textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', margin: 3 });
            _this.append(_this._textholder);
            var hbox = new Ui.HBox();
            _this.append(hbox);
            _this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
            _this.connect(_this.entry, 'focus', _this.onEntryFocus);
            _this.connect(_this.entry, 'blur', _this.onEntryBlur);
            hbox.append(_this.entry, true);
            _this.connect(_this.entry, 'change', _this.onEntryChange);
            _this.button = new TextFieldButton({ orientation: 'horizontal', margin: 1 });
            hbox.append(_this.button);
            _this.connect(_this, 'submit', _this.onFormSubmit);
            _this.connect(_this.button, 'press', _this.onButtonPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(TextButtonField.prototype, "textHolder", {
            set: function (text) {
                this._textholder.text = text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextButtonField.prototype, "widthText", {
            set: function (nbchar) {
                this.entry.width = nbchar * 16 * 2 / 3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextButtonField.prototype, "buttonIcon", {
            set: function (icon) {
                this.button.icon = icon;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextButtonField.prototype, "buttonText", {
            set: function (text) {
                this.button.text = text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextButtonField.prototype, "textValue", {
            get: function () {
                return this.entry.value;
            },
            set: function (value) {
                this.entry.value = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextButtonField.prototype, "value", {
            get: function () {
                return this.textValue;
            },
            set: function (value) {
                this.textValue = value;
            },
            enumerable: true,
            configurable: true
        });
        TextButtonField.prototype.onButtonPress = function () {
            this.fireEvent('buttonpress', this);
            this.fireEvent('validate', this, this.value);
        };
        TextButtonField.prototype.onEntryChange = function (entry, value) {
            this.fireEvent('change', this, value);
        };
        TextButtonField.prototype.onFormSubmit = function () {
            this.fireEvent('validate', this, this.value);
        };
        TextButtonField.prototype.onEntryFocus = function () {
            this._textholder.hide();
            this.graphic.hasFocus = true;
        };
        TextButtonField.prototype.onEntryBlur = function () {
            if (this.value === '')
                this._textholder.show();
            this.graphic.hasFocus = false;
        };
        return TextButtonField;
    }(Ui.Form));
    Ui.TextButtonField = TextButtonField;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DatePicker = (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(init) {
            var _this = _super.call(this) || this;
            _this.lastValid = '';
            _this._isValid = false;
            _this.buttonIcon = 'calendar';
            _this.widthText = 9;
            _this.connect(_this, 'buttonpress', _this.onDatePickerButtonPress);
            _this.connect(_this, 'change', _this.onDatePickerChange);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(DatePicker.prototype, "dayFilter", {
            set: function (dayFilter) {
                this._dayFilter = dayFilter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DatePicker.prototype, "dateFilter", {
            set: function (dateFilter) {
                this._dateFilter = dateFilter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DatePicker.prototype, "isValid", {
            get: function () {
                return this._isValid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DatePicker.prototype, "selectedDate", {
            get: function () {
                return this._selectedDate;
            },
            set: function (date) {
                if (date === undefined) {
                    this._selectedDate = undefined;
                }
                else {
                    this.lastValid = ((date.getDate() < 10) ? '0' : '') + date.getDate() + '/' + ((date.getMonth() < 9) ? '0' : '') + (date.getMonth() + 1) + '/' + date.getFullYear();
                    this._selectedDate = date;
                    this.textValue = this.lastValid;
                }
                this._isValid = true;
                this.fireEvent('change', this, this.selectedDate);
            },
            enumerable: true,
            configurable: true
        });
        DatePicker.prototype.onDatePickerButtonPress = function () {
            var splitDate = this.textValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
            if (splitDate !== null) {
                this.selectedDate = new Date();
                this.selectedDate.setFullYear(parseInt(splitDate[3]), parseInt(splitDate[2]) - 1, parseInt(splitDate[1]));
            }
            this.popup = new Ui.Popup();
            if (this.selectedDate !== undefined)
                this.calendar = new Ui.MonthCalendar({ horizontalAlign: 'center', margin: 10, selectedDate: this.selectedDate, date: this.selectedDate });
            else
                this.calendar = new Ui.MonthCalendar({ horizontalAlign: 'center', margin: 10 });
            if (this._dayFilter !== undefined)
                this.calendar.dayFilter = this._dayFilter;
            if (this._dateFilter !== undefined)
                this.calendar.dateFilter = this._dateFilter;
            this.popup.content = this.calendar;
            this.connect(this.calendar, 'dayselect', this.onDaySelect);
            this.popup.openElement(this);
        };
        DatePicker.prototype.onDatePickerChange = function () {
            this._isValid = false;
            this._selectedDate = undefined;
            var dateStr = this.textValue;
            if (dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/)) {
                var splitDate = this.textValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
                var date = new Date();
                date.setFullYear(parseInt(splitDate[3]), parseInt(splitDate[2]) - 1, parseInt(splitDate[1]));
                var newStr = ((date.getDate() < 10) ? '0' : '') + date.getDate() + '/' + ((date.getMonth() < 9) ? '0' : '') + (date.getMonth() + 1) + '/' + date.getFullYear();
                if ((parseInt(splitDate[3]) != date.getFullYear()) || (parseInt(splitDate[2]) - 1 != date.getMonth()) || (parseInt(splitDate[1]) != date.getDate())) {
                    this.lastValid = newStr;
                    this.textValue = this.lastValid;
                }
                this._selectedDate = date;
                this._isValid = true;
            }
            else if (dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{0,4})$/))
                this.lastValid = dateStr;
            else if (dateStr.match(/^(\d{1,2})\/(\d{0,2})$/))
                this.lastValid = dateStr;
            else if (dateStr.match(/^(\d{0,2})$/))
                this.lastValid = dateStr;
            else
                this.textValue = this.lastValid;
        };
        DatePicker.prototype.onDaySelect = function (monthcalendar, date) {
            this.selectedDate = date;
            this.popup.close();
            this.popup = undefined;
        };
        return DatePicker;
    }(Ui.TextButtonField));
    Ui.DatePicker = DatePicker;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DownloadButton = (function (_super) {
        __extends(DownloadButton, _super);
        function DownloadButton(init) {
            var _this = _super.call(this) || this;
            _this.style = {
                background: '#a4f4a4'
            };
            _this.addEvents('download');
            _this.connect(_this, 'link', _this.onLinkPress);
            if (init)
                _this.assign(init);
            return _this;
        }
        DownloadButton.prototype.onLinkPress = function () {
            this.fireEvent('download', this);
        };
        return DownloadButton;
    }(Ui.LinkButton));
    Ui.DownloadButton = DownloadButton;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var SVGElement = (function (_super) {
        __extends(SVGElement, _super);
        function SVGElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SVGElement.prototype.renderSVG = function (svg) {
        };
        SVGElement.prototype.renderDrawing = function () {
            var svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('focusable', 'false');
            var content = this.renderSVG(svg);
            if (content !== undefined)
                svg.appendChild(content);
            return svg;
        };
        return SVGElement;
    }(Ui.Element));
    Ui.SVGElement = SVGElement;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var IFrame = (function (_super) {
        __extends(IFrame, _super);
        function IFrame(init) {
            var _this = _super.call(this) || this;
            _this._isReady = false;
            _this.connect(_this.iframeDrawing, 'load', _this.onIFrameLoad);
            _this.addEvents('ready');
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(IFrame.prototype, "src", {
            get: function () {
                return this.iframeDrawing.getAttribute('src');
            },
            set: function (src) {
                this.iframeDrawing.setAttribute('src', src);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IFrame.prototype, "isReady", {
            get: function () {
                return this._isReady;
            },
            enumerable: true,
            configurable: true
        });
        IFrame.prototype.onIFrameLoad = function () {
            if (!this._isReady) {
                this._isReady = true;
                this.fireEvent('ready', this);
            }
        };
        IFrame.prototype.renderDrawing = function () {
            if (Core.Navigator.iOs) {
                var drawing = _super.prototype.renderDrawing.call(this);
                drawing.style.overflow = 'scroll';
                drawing.style.webkitOverflowScrolling = 'touch';
                this.iframeDrawing = document.createElement('iframe');
                this.iframeDrawing.scrolling = 'no';
                this.iframeDrawing.style.border = '0px';
                this.iframeDrawing.style.margin = '0px';
                this.iframeDrawing.style.padding = '0px';
                this.iframeDrawing.style.width = '100%';
                this.iframeDrawing.style.height = '100%';
                drawing.appendChild(this.iframeDrawing);
                return drawing;
            }
            else {
                this.iframeDrawing = document.createElement('iframe');
                this.iframeDrawing.style.border = '0px';
                this.iframeDrawing.style.margin = '0px';
                this.iframeDrawing.style.padding = '0px';
                this.iframeDrawing.style.width = '100%';
                this.iframeDrawing.style.height = '100%';
                if (Core.Navigator.isIE)
                    this.iframeDrawing.frameBorder = '0';
                return this.iframeDrawing;
            }
        };
        IFrame.prototype.arrangeCore = function (width, height) {
            this.iframeDrawing.style.width = width + 'px';
        };
        return IFrame;
    }(Ui.Element));
    Ui.IFrame = IFrame;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ContentEditable = (function (_super) {
        __extends(ContentEditable, _super);
        function ContentEditable(init) {
            var _this = _super.call(this) || this;
            _this.anchorOffset = 0;
            _this.addEvents('anchorchange');
            _this.selectable = true;
            _this.drawing.setAttribute('contenteditable', 'true');
            _this.connect(_this.drawing, 'keyup', _this.onKeyUp);
            _this.connect(_this.drawing, 'DOMSubtreeModified', _this.onContentSubtreeModified);
            if (init)
                _this.assign(init);
            return _this;
        }
        ContentEditable.prototype.onKeyUp = function (event) {
            this.testAnchorChange();
        };
        ContentEditable.prototype.testAnchorChange = function () {
            if ((window.getSelection().anchorNode != this.anchorNode) ||
                (window.getSelection().anchorOffset != this.anchorOffset)) {
                this.anchorNode = window.getSelection().anchorNode;
                this.anchorOffset = window.getSelection().anchorOffset;
                this.fireEvent('anchorchange', this);
            }
        };
        ContentEditable.prototype.onContentSubtreeModified = function (event) {
            this.testAnchorChange();
            this.invalidateMeasure();
        };
        return ContentEditable;
    }(Ui.Html));
    Ui.ContentEditable = ContentEditable;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ScrollLoader = (function (_super) {
        __extends(ScrollLoader, _super);
        function ScrollLoader() {
            var _this = _super.call(this) || this;
            _this.addEvents('change');
            return _this;
        }
        ScrollLoader.prototype.getMin = function () {
            return 0;
        };
        ScrollLoader.prototype.getMax = function () {
            return -1;
        };
        ScrollLoader.prototype.getElementAt = function (position) {
            return undefined;
        };
        return ScrollLoader;
    }(Core.Object));
    Ui.ScrollLoader = ScrollLoader;
    var VBoxScrollable = (function (_super) {
        __extends(VBoxScrollable, _super);
        function VBoxScrollable(init) {
            var _this = _super.call(this) || this;
            _this._scrollHorizontal = true;
            _this._scrollVertical = true;
            _this.scrollbarHorizontalNeeded = false;
            _this.scrollbarVerticalNeeded = false;
            _this.showShadows = false;
            _this.lock = false;
            _this.isOver = false;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.viewWidth = 0;
            _this.viewHeight = 0;
            _this.contentWidth = 0;
            _this.contentHeight = 0;
            _this.scrollLock = false;
            _this.addEvents('scroll');
            _this.contentBox = new VBoxScrollableContent();
            _this.connect(_this.contentBox, 'scroll', _this.onScroll);
            _this.connect(_this.contentBox, 'down', _this.autoShowScrollbars);
            _this.connect(_this.contentBox, 'inertiaend', _this.autoHideScrollbars);
            _this.appendChild(_this.contentBox);
            _this.connect(_this, 'ptrmove', function (event) {
                if (!_this.isDisabled && !event.pointer.getIsDown() && (_this.overWatcher === undefined)) {
                    _this.overWatcher = event.pointer.watch(_this);
                    _this.isOver = true;
                    _this.autoShowScrollbars();
                    _this.connect(_this.overWatcher, 'move', function () {
                        if (!this.overWatcher.getIsInside())
                            this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'down', function () {
                        this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'up', function () {
                        this.overWatcher.cancel();
                    });
                    _this.connect(_this.overWatcher, 'cancel', function () {
                        this.overWatcher = undefined;
                        this.isOver = false;
                        this.autoHideScrollbars();
                    });
                }
            });
            _this.connect(_this, 'wheel', _this.onWheel);
            if (init)
                _this.assign(init);
            return _this;
        }
        VBoxScrollable.prototype.reload = function () {
            this.contentBox.reload();
        };
        VBoxScrollable.prototype.getActiveItems = function () {
            return this.contentBox.getActiveItems();
        };
        Object.defineProperty(VBoxScrollable.prototype, "loader", {
            set: function (loader) {
                this.contentBox.setLoader(loader);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "maxScale", {
            set: function (maxScale) {
                this.contentBox.maxScale = maxScale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "content", {
            get: function () {
                return this.contentBox.content;
            },
            set: function (content) {
                this.contentBox.content = content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "scrollHorizontal", {
            get: function () {
                return this._scrollHorizontal;
            },
            set: function (scroll) {
                if (scroll !== this._scrollHorizontal) {
                    this._scrollHorizontal = scroll;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "scrollVertical", {
            get: function () {
                return this._scrollVertical;
            },
            set: function (scroll) {
                if (scroll !== this._scrollVertical) {
                    this._scrollVertical = scroll;
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "scrollbarVertical", {
            get: function () {
                return this._scrollbarVertical;
            },
            set: function (scrollbarVertical) {
                if (this._scrollbarVertical) {
                    this.disconnect(this._scrollbarVertical, 'down', this.autoShowScrollbars);
                    this.disconnect(this._scrollbarVertical, 'up', this.autoHideScrollbars);
                    this.disconnect(this._scrollbarVertical, 'move', this.onScrollbarVerticalMove);
                    this.removeChild(this._scrollbarVertical);
                }
                if (scrollbarVertical) {
                    this._scrollbarVertical = scrollbarVertical;
                    this._scrollbarVertical.moveHorizontal = false;
                    this.connect(this._scrollbarVertical, 'down', this.autoShowScrollbars);
                    this.connect(this._scrollbarVertical, 'up', this.autoHideScrollbars);
                    this.connect(this._scrollbarVertical, 'move', this.onScrollbarVerticalMove);
                    this._scrollbarVertical.opacity = 0;
                    this.appendChild(this._scrollbarVertical);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VBoxScrollable.prototype, "scrollbarHorizontal", {
            get: function () {
                return this._scrollbarHorizontal;
            },
            set: function (scrollbarHorizontal) {
                if (this._scrollbarHorizontal) {
                    this.disconnect(this._scrollbarHorizontal, 'down', this.autoShowScrollbars);
                    this.disconnect(this._scrollbarHorizontal, 'up', this.autoHideScrollbars);
                    this.disconnect(this._scrollbarHorizontal, 'move', this.onScrollbarHorizontalMove);
                    this.removeChild(this._scrollbarHorizontal);
                }
                if (scrollbarHorizontal) {
                    this._scrollbarHorizontal = scrollbarHorizontal;
                    this._scrollbarHorizontal.moveVertical = false;
                    this.connect(this._scrollbarHorizontal, 'down', this.autoShowScrollbars);
                    this.connect(this._scrollbarHorizontal, 'up', this.autoHideScrollbars);
                    this.connect(this._scrollbarHorizontal, 'move', this.onScrollbarHorizontalMove);
                    this._scrollbarHorizontal.opacity = 0;
                    this.appendChild(this._scrollbarHorizontal);
                }
            },
            enumerable: true,
            configurable: true
        });
        VBoxScrollable.prototype.setOffset = function (offsetX, offsetY, absolute) {
            if (absolute === void 0) { absolute = false; }
            if (offsetX === undefined)
                offsetX = this.offsetX;
            else if (!absolute)
                offsetX *= this.contentWidth - this.viewWidth;
            if (offsetY === undefined)
                offsetY = this.offsetY;
            else if (!absolute)
                offsetY *= this.contentHeight - this.viewHeight;
            if (offsetX < 0)
                offsetX = 0;
            else if (this.viewWidth + offsetX > this.contentWidth)
                offsetX = this.contentWidth - this.viewWidth;
            if (offsetY < 0)
                offsetY = 0;
            else if (this.viewHeight + offsetY > this.contentHeight)
                offsetY = this.contentHeight - this.viewHeight;
            this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
            this.relativeOffsetY = offsetY / (this.contentHeight - this.viewHeight);
            if ((this.offsetX !== offsetX) || (this.offsetY !== offsetY)) {
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.contentBox.setOffset(offsetX, offsetY);
                return true;
            }
            else
                return false;
        };
        VBoxScrollable.prototype.getOffsetX = function () {
            return this.contentBox.getOffsetX();
        };
        VBoxScrollable.prototype.getRelativeOffsetX = function () {
            return this.relativeOffsetX;
        };
        VBoxScrollable.prototype.getOffsetY = function () {
            return this.contentBox.getOffsetY();
        };
        VBoxScrollable.prototype.getRelativeOffsetY = function () {
            return this.relativeOffsetY;
        };
        VBoxScrollable.prototype.onWheel = function (event) {
            if (this.setOffset(this.contentBox.getOffsetX() + event.deltaX * 3, this.contentBox.getOffsetY() + event.deltaY * 3, true)) {
                event.stopPropagation();
            }
        };
        VBoxScrollable.prototype.autoShowScrollbars = function () {
            if (this.showClock == undefined) {
                this.showClock = new Anim.Clock({ duration: 'forever' });
                this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
                this.showClock.begin();
            }
        };
        VBoxScrollable.prototype.autoHideScrollbars = function () {
            if (this.contentBox.isDown || this.contentBox.isInertia || this.isOver ||
                (this.scrollbarVertical && this.scrollbarVertical.isDown) ||
                (this.scrollbarHorizontal && this.scrollbarHorizontal.isDown))
                return;
            if (this.showClock === undefined) {
                this.showClock = new Anim.Clock({ duration: 'forever' });
                this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
                this.showClock.begin();
            }
        };
        VBoxScrollable.prototype.onShowBarsTick = function (clock, progress, delta) {
            var show = (this.contentBox.isDown || this.contentBox.isInertia || this.isOver ||
                (this.scrollbarVertical && this.scrollbarVertical.isDown) ||
                (this.scrollbarHorizontal && this.scrollbarHorizontal.isDown));
            var stop = false;
            var speed = 2;
            var opacity = this.scrollbarHorizontal.opacity;
            if (show) {
                opacity += (delta * speed);
                if (opacity >= 1) {
                    opacity = 1;
                    stop = true;
                }
            }
            else {
                opacity -= (delta * speed);
                if (opacity <= 0) {
                    opacity = 0;
                    stop = true;
                }
            }
            this.scrollbarHorizontal.opacity = opacity;
            this.scrollbarVertical.opacity = opacity;
            if (stop) {
                this.showClock.stop();
                this.showClock = undefined;
            }
        };
        VBoxScrollable.prototype.onScroll = function () {
            this.updateOffset();
            this.fireEvent('scroll', this, this.offsetX, this.offsetY);
        };
        VBoxScrollable.prototype.updateOffset = function () {
            if (this.contentBox === undefined)
                return;
            this.offsetX = this.contentBox.getOffsetX();
            this.offsetY = this.contentBox.getOffsetY();
            this.viewWidth = this.layoutWidth;
            this.viewHeight = this.layoutHeight;
            this.contentWidth = this.contentBox.getContentWidth();
            this.contentHeight = this.contentBox.getContentHeight();
            this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
            this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
            if (this.contentHeight > this.viewHeight)
                this.scrollbarVerticalNeeded = true;
            else
                this.scrollbarVerticalNeeded = false;
            if (this.contentWidth > this.viewWidth)
                this.scrollbarHorizontalNeeded = true;
            else
                this.scrollbarHorizontalNeeded = false;
            if (this.scrollbarVerticalNeeded) {
                this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVertical.measureHeight);
                this.scrollbarVertical.arrange(this.layoutWidth - this.scrollbarVertical.measureWidth, 0, this.scrollbarVertical.measureWidth, this.scrollbarVerticalHeight);
                this.scrollbarVertical.show();
            }
            else {
                this.scrollbarVertical.hide();
                this.offsetY = 0;
            }
            if (this.scrollbarHorizontalNeeded) {
                this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontal.measureWidth);
                this.scrollbarHorizontal.arrange(0, this.layoutHeight - this.scrollbarHorizontal.measureHeight, this.scrollbarHorizontalWidth, this.scrollbarHorizontal.measureHeight);
                this.scrollbarHorizontal.show();
            }
            else {
                this.scrollbarHorizontal.hide();
                this.offsetX = 0;
            }
            this.scrollLock = true;
            if (this.scrollbarHorizontalNeeded) {
                var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
                if (relOffsetX > 1) {
                    relOffsetX = 1;
                    this.setOffset(relOffsetX, undefined);
                }
                this.scrollbarHorizontal.setPosition((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, undefined);
            }
            if (this.scrollbarVerticalNeeded) {
                var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
                if (relOffsetY > 1) {
                    relOffsetY = 1;
                    this.setOffset(undefined, relOffsetY);
                }
                this.scrollbarVertical.setPosition(undefined, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY);
            }
            this.scrollLock = false;
        };
        VBoxScrollable.prototype.onScrollbarHorizontalMove = function (movable) {
            if (this.scrollLock)
                return;
            var totalWidth = this.viewWidth - this.scrollbarHorizontal.layoutWidth;
            var offsetX = Math.min(1, Math.max(0, movable.positionX / totalWidth));
            this.setOffset(offsetX, undefined);
            movable.setPosition(offsetX * totalWidth, undefined);
        };
        VBoxScrollable.prototype.onScrollbarVerticalMove = function (movable) {
            if (this.scrollLock)
                return;
            var totalHeight = this.viewHeight - this.scrollbarVertical.layoutHeight;
            var offsetY = Math.min(1, Math.max(0, movable.positionY / totalHeight));
            this.setOffset(undefined, offsetY);
            movable.setPosition(undefined, offsetY * totalHeight);
        };
        VBoxScrollable.prototype.measureCore = function (width, height) {
            var size = { width: 0, height: 0 };
            this.scrollbarHorizontal.measure(width, height);
            var sSize = this.scrollbarVertical.measure(width, height);
            var contentSize = this.contentBox.measure(width, height);
            if (contentSize.width < width)
                size.width = contentSize.width;
            else
                size.width = width;
            if (contentSize.height < height)
                size.height = contentSize.height;
            else
                size.height = height;
            if (!this.scrollVertical)
                size.height = contentSize.height;
            if (!this.scrollHorizontal)
                size.width = contentSize.width;
            return size;
        };
        VBoxScrollable.prototype.arrangeCore = function (width, height) {
            this.viewWidth = width;
            this.viewHeight = height;
            this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);
            this.contentWidth = this.contentBox.getContentWidth();
            this.contentHeight = this.contentBox.getContentHeight();
            this.updateOffset();
        };
        return VBoxScrollable;
    }(Ui.Container));
    Ui.VBoxScrollable = VBoxScrollable;
    var VBoxScrollableContent = (function (_super) {
        __extends(VBoxScrollableContent, _super);
        function VBoxScrollableContent() {
            var _this = _super.call(this) || this;
            _this.contentWidth = 0;
            _this.contentHeight = 0;
            _this.estimatedHeight = 36;
            _this.estimatedHeightNeeded = true;
            _this.activeItemsPos = 0;
            _this.activeItemsY = 0;
            _this.activeItemsHeight = 0;
            _this.reloadNeeded = false;
            _this.addEvents('scroll');
            _this.activeItems = [];
            _this.clipToBounds = true;
            _this.connect(_this.drawing, 'scroll', function () {
                _this.translateX -= _this.drawing.scrollLeft;
                _this.translateY -= _this.drawing.scrollTop;
                _this.drawing.scrollLeft = 0;
                _this.drawing.scrollTop = 0;
                _this.onContentTransform(false);
            });
            _this.allowTranslate = true;
            _this.allowRotate = false;
            _this.minScale = 1;
            _this.maxScale = 1;
            _this.inertia = true;
            _this.setTransformOrigin(0, 0);
            _this.removeChild(_this.contentBox);
            return _this;
        }
        VBoxScrollableContent.prototype.setLoader = function (loader) {
            if (this.loader !== loader) {
                if (this.loader !== undefined)
                    this.disconnect(this.loader, 'change', this.onLoaderChange);
                this.loader = loader;
                if (this.loader !== undefined)
                    this.connect(this.loader, 'change', this.onLoaderChange);
                this.reload();
            }
        };
        VBoxScrollableContent.prototype.getActiveItems = function () {
            return this.activeItems;
        };
        VBoxScrollableContent.prototype.getOffsetX = function () {
            return -this.translateX;
        };
        VBoxScrollableContent.prototype.getOffsetY = function () {
            return Math.max(0, (((-this.translateY) / this.scale) - this.getMinY()) * this.scale);
        };
        VBoxScrollableContent.prototype.setOffset = function (x, y) {
            var minY = this.getMinY();
            var translateY = -(((y / this.scale) + minY) * this.scale);
            this.setContentTransform(-x, translateY, undefined, undefined);
        };
        VBoxScrollableContent.prototype.getContentWidth = function () {
            return this.contentWidth;
        };
        VBoxScrollableContent.prototype.getContentHeight = function () {
            return this.getEstimatedContentHeight() * this.scale;
        };
        VBoxScrollableContent.prototype.getEstimatedContentHeight = function () {
            var itemsBefore = (this.activeItemsPos - this.loader.getMin());
            var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
            var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
            var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
            return maxY - minY;
        };
        VBoxScrollableContent.prototype.getMinY = function () {
            var itemsBefore = (this.activeItemsPos - this.loader.getMin());
            var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
            return minY;
        };
        VBoxScrollableContent.prototype.getMaxY = function () {
            var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
            var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
            return maxY;
        };
        VBoxScrollableContent.prototype.loadItems = function () {
            if (this.loader.getMax() - this.loader.getMin() < 0)
                return;
            var w = this.layoutWidth;
            var h = this.layoutHeight;
            if ((w === 0) || (h === 0))
                return;
            var matrix = this.matrix;
            var invMatrix = matrix.inverse();
            var p0 = (new Ui.Point(0, 0)).multiply(invMatrix);
            var p1 = (new Ui.Point(w, h)).multiply(invMatrix);
            var refPos;
            var refY;
            var stillActiveItems = [];
            var stillActiveHeight = 0;
            var y = this.activeItemsY;
            for (var i = 0; i < this.activeItems.length; i++) {
                var activeItem = this.activeItems[i];
                var itemHeight = activeItem.measureHeight;
                if (((y >= p0.y) && (y <= p1.y)) || ((y + itemHeight >= p0.y) && (y + itemHeight <= p1.y)) ||
                    ((y <= p0.y) && (y + itemHeight >= p1.y))) {
                    if (refPos === undefined) {
                        refPos = (i + this.activeItemsPos);
                        refY = y;
                    }
                    stillActiveItems.push(activeItem);
                    stillActiveHeight += activeItem.measureHeight;
                }
                else {
                    this.removeChild(activeItem);
                }
                y += itemHeight;
            }
            if (refPos === undefined) {
                refPos = Math.floor((-this.translateY) / (this.estimatedHeight * this.scale));
                refPos = Math.max(this.loader.getMin(), Math.min(this.loader.getMax(), refPos));
                refY = -this.translateY / this.scale;
                this.activeItemsPos = refPos;
                this.activeItems = [];
                var item = this.loader.getElementAt(refPos);
                this.appendChild(item);
                var size = item.measure(w, h);
                item.arrange(0, 0, w, size.height);
                item.setTransformOrigin(0, 0);
                this.activeItems.push(item);
                this.activeItemsHeight = size.height;
            }
            else {
                this.activeItemsPos = refPos;
                this.activeItems = stillActiveItems;
                this.activeItemsHeight = stillActiveHeight;
            }
            while (refY > p0.y) {
                var pos = this.activeItemsPos - 1;
                if (pos < this.loader.getMin())
                    break;
                var item = this.loader.getElementAt(pos);
                this.prependChild(item);
                var size = item.measure(w, h);
                item.arrange(0, 0, w, size.height);
                item.setTransformOrigin(0, 0);
                this.activeItems.unshift(item);
                this.activeItemsHeight += size.height;
                refY -= size.height;
                this.activeItemsPos = pos;
            }
            while (refY + this.activeItemsHeight < p1.y) {
                var pos = this.activeItemsPos + this.activeItems.length;
                if (pos > this.loader.getMax())
                    break;
                var item = this.loader.getElementAt(pos);
                this.appendChild(item);
                var size = item.measure(w, h);
                item.arrange(0, 0, w, size.height);
                item.setTransformOrigin(0, 0);
                this.activeItems.push(item);
                this.activeItemsHeight += size.height;
            }
            this.activeItemsY = refY;
            this.activeItemsHeight = 0;
            for (var i = 0; i < this.activeItems.length; i++) {
                var item = this.activeItems[i];
                item.transform = matrix.clone().translate(0, this.activeItemsY + this.activeItemsHeight);
                this.activeItemsHeight += item.measureHeight;
            }
            if (this.estimatedHeightNeeded) {
                this.estimatedHeightNeeded = false;
                this.estimatedHeight = this.activeItemsHeight / this.activeItems.length;
            }
        };
        VBoxScrollableContent.prototype.updateItems = function () {
            var w = this.layoutWidth;
            var h = this.layoutHeight;
        };
        VBoxScrollableContent.prototype.reload = function () {
            for (var i = 0; i < this.activeItems.length; i++)
                this.removeChild(this.activeItems[i]);
            this.activeItems = [];
            this.activeItemsPos = 0;
            this.activeItemsY = 0;
            this.activeItemsHeight = 0;
            this.estimatedHeightNeeded = true;
            this.onContentTransform(false);
        };
        VBoxScrollableContent.prototype.onLoaderChange = function () {
            this.reloadNeeded = true;
            this.invalidateMeasure();
        };
        VBoxScrollableContent.prototype.measureCore = function (width, height) {
            if (this.reloadNeeded) {
                this.reloadNeeded = false;
                this.reload();
            }
            var y = 0;
            for (var i = 0; i < this.activeItems.length; i++) {
                var item = this.activeItems[i];
                var size = item.measure(width, 0);
                y += size.height;
            }
            this.activeItemsHeight = y;
            return { width: width, height: this.getEstimatedContentHeight() };
        };
        VBoxScrollableContent.prototype.arrangeCore = function (width, height) {
            for (var i = 0; i < this.activeItems.length; i++) {
                var activeItem = this.activeItems[i];
                activeItem.arrange(0, 0, width, activeItem.measureHeight);
            }
            this.loadItems();
        };
        VBoxScrollableContent.prototype.onContentTransform = function (testOnly) {
            var scale = this.scale;
            if (this.translateX > 0)
                this.translateX = 0;
            var itemsBefore = (this.activeItemsPos - this.loader.getMin());
            var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
            var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
            var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
            minY *= scale;
            maxY *= scale;
            var viewWidth = this.layoutWidth;
            var viewHeight = this.layoutHeight;
            this.contentWidth = this.layoutWidth * scale;
            this.contentHeight = this.getEstimatedContentHeight() * scale;
            this.translateX = Math.max(this.translateX, -(this.contentWidth - viewWidth));
            if (this.translateY < -(maxY - viewHeight))
                this.translateY = -(maxY - viewHeight);
            if (this.translateY > -minY)
                this.translateY = -minY;
            this.loadItems();
            this.contentWidth = this.layoutWidth * scale;
            this.contentHeight = this.getEstimatedContentHeight() * scale;
            if (testOnly !== true)
                this.fireEvent('scroll', this);
        };
        VBoxScrollableContent.prototype.onChildInvalidateMeasure = function (child, event) {
            this.invalidateLayout();
        };
        return VBoxScrollableContent;
    }(Ui.Transformable));
    Ui.VBoxScrollableContent = VBoxScrollableContent;
    var VBoxScrollingArea = (function (_super) {
        __extends(VBoxScrollingArea, _super);
        function VBoxScrollingArea(init) {
            var _this = _super.call(this) || this;
            _this.horizontalScrollbar = new Ui.Scrollbar('horizontal');
            _this.scrollbarHorizontal = _this.horizontalScrollbar;
            _this.verticalScrollbar = new Ui.Scrollbar('vertical');
            _this.scrollbarVertical = _this.verticalScrollbar;
            if (init)
                _this.assign(init);
            return _this;
        }
        VBoxScrollingArea.prototype.onStyleChange = function () {
            var radius = this.getStyleProperty('radius');
            this.horizontalScrollbar.radius = radius;
            this.verticalScrollbar.radius = radius;
            var color = this.getStyleProperty('color');
            this.horizontalScrollbar.fill = color;
            this.verticalScrollbar.fill = color;
        };
        VBoxScrollingArea.style = {
            color: 'rgba(50,50,50,0.7)',
            radius: 0
        };
        return VBoxScrollingArea;
    }(VBoxScrollable));
    Ui.VBoxScrollingArea = VBoxScrollingArea;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var ListViewHeader = (function (_super) {
        __extends(ListViewHeader, _super);
        function ListViewHeader(init) {
            var _this = _super.call(this) || this;
            _this.background = new Ui.Rectangle({ verticalAlign: 'bottom', height: 4 });
            _this.append(_this.background);
            _this.uiTitle = new Ui.Label({ margin: 8, fontWeight: 'bold' });
            _this.append(_this.uiTitle);
            _this.connect(_this, 'down', _this.onListViewHeaderDown);
            _this.connect(_this, 'up', _this.onListViewHeaderUp);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(ListViewHeader.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                if (this._title !== title) {
                    this._title = title;
                    this.uiTitle.text = title;
                }
            },
            enumerable: true,
            configurable: true
        });
        ListViewHeader.prototype.getColor = function () {
            return Ui.Color.create(this.getStyleProperty('color'));
        };
        ListViewHeader.prototype.getColorDown = function () {
            var yuv = Ui.Color.create(this.getStyleProperty('color')).getYuv();
            return Ui.Color.createFromYuv(yuv.y + 0.40, yuv.u, yuv.v);
        };
        ListViewHeader.prototype.onListViewHeaderDown = function () {
            this.background.fill = this.getColorDown();
        };
        ListViewHeader.prototype.onListViewHeaderUp = function () {
            this.background.fill = this.getColor();
        };
        ListViewHeader.prototype.onStyleChange = function () {
            this.background.fill = this.getStyleProperty('color');
            var spacing = this.getStyleProperty('spacing');
            this.uiTitle.margin = spacing + 2;
        };
        ListViewHeader.style = {
            color: '#444444',
            spacing: 5
        };
        return ListViewHeader;
    }(Ui.Pressable));
    Ui.ListViewHeader = ListViewHeader;
    var ListViewHeadersBar = (function (_super) {
        __extends(ListViewHeadersBar, _super);
        function ListViewHeadersBar(config) {
            var _this = _super.call(this) || this;
            _this.sortInvert = false;
            _this.rowsHeight = 0;
            _this.headersHeight = 0;
            _this.addEvents('header');
            _this.headers = config.headers;
            delete (config.headers);
            _this.sortArrow = new Ui.Icon({ icon: 'sortarrow', width: 10, height: 10, margin: 4 });
            _this.appendChild(_this.sortArrow);
            _this.cols = [];
            for (var i = 0; i < _this.headers.length; i++) {
                var header = _this.headers[i];
                var headerUi = new ListViewHeader({ title: header.title, width: header.width });
                header['Ui.ListViewHeadersBar.ui'] = headerUi;
                _this.connect(header['Ui.ListViewHeadersBar.ui'], 'press', _this.onHeaderPress);
                header.colWidth = header.width;
                _this.appendChild(header['Ui.ListViewHeadersBar.ui']);
                var col = new ListViewColBar(headerUi);
                _this.cols.push(col);
                _this.appendChild(col);
            }
            return _this;
        }
        ListViewHeadersBar.prototype.getSortColKey = function () {
            return this.sortColKey;
        };
        ListViewHeadersBar.prototype.getSortInvert = function () {
            return this.sortInvert;
        };
        ListViewHeadersBar.prototype.sortBy = function (key, invert) {
            this.sortColKey = key;
            this.sortInvert = invert === true;
            if (this.sortInvert)
                this.sortArrow.transform = Ui.Matrix.createRotate(180);
            else
                this.sortArrow.transform = undefined;
            this.invalidateArrange();
        };
        ListViewHeadersBar.prototype.onHeaderPress = function (header) {
            var key;
            for (var col = 0; col < this.headers.length; col++) {
                var h = this.headers[col];
                if (h['Ui.ListViewHeadersBar.ui'] === header) {
                    key = h.key;
                }
            }
            if (key !== undefined) {
                this.fireEvent('header', this, key);
            }
        };
        ListViewHeadersBar.prototype.measureCore = function (width, height) {
            this.rowsHeight = 0;
            this.headersHeight = 0;
            var minHeight = 0;
            var col;
            var size;
            var header;
            for (col = 0; col < this.headers.length; col++) {
                header = this.headers[col];
                size = header['Ui.ListViewHeadersBar.ui'].measure(0, 0);
                if (size.height > minHeight)
                    minHeight = size.height;
            }
            this.headersHeight = minHeight;
            var minWidth = 0;
            for (col = 0; col < this.headers.length; col++)
                minWidth += this.headers[col]['Ui.ListViewHeadersBar.ui'].measureWidth;
            this.sortArrow.measure(0, 0);
            for (var i = 0; i < this.cols.length; i++) {
                col = this.cols[i];
                col.measure(0, this.headersHeight + this.rowsHeight);
            }
            return { width: minWidth, height: this.headersHeight };
        };
        ListViewHeadersBar.prototype.arrangeCore = function (width, height) {
            var x = 0;
            var header;
            var colWidth;
            var col;
            var availableWidth = width;
            for (col = 0; col < this.headers.length; col++) {
                header = this.headers[col];
                var colbar = this.cols[col];
                colWidth = header['Ui.ListViewHeadersBar.ui'].measureWidth;
                if (col == this.headers.length - 1)
                    colWidth = Math.max(colWidth, availableWidth);
                header['Ui.ListViewHeadersBar.ui'].arrange(x, 0, colWidth, this.headersHeight);
                colbar.setHeaderHeight(this.headersHeight);
                colbar.arrange(x + colWidth - colbar.measureWidth, 0, colbar.measureWidth, this.headersHeight);
                if (this.sortColKey === header.key) {
                    this.sortArrow.arrange(x + colWidth - height * 0.8, height * 0.1, height * 0.8, height * 0.8);
                }
                x += colWidth;
                availableWidth -= colWidth;
            }
        };
        return ListViewHeadersBar;
    }(Ui.Container));
    Ui.ListViewHeadersBar = ListViewHeadersBar;
    var ListViewRow = (function (_super) {
        __extends(ListViewRow, _super);
        function ListViewRow(init) {
            var _this = _super.call(this) || this;
            _this.headers = init.headers;
            _this.data = init.data;
            _this.draggableData = _this.data;
            _this.selectionActions = init.selectionActions;
            _this.cells = [];
            _this.background = new Ui.Rectangle();
            _this.appendChild(_this.background);
            for (var col = 0; col < _this.headers.length; col++) {
                var key = _this.headers[col].key;
                var cell = void 0;
                if (_this.headers[col].ui !== undefined) {
                    cell = new _this.headers[col].ui();
                    cell.setKey(key);
                }
                else {
                    cell = new ListViewCellString();
                    cell.setKey(key);
                }
                cell.setValue(_this.data[_this.headers[col].key]);
                _this.cells.push(cell);
                _this.appendChild(cell);
            }
            return _this;
        }
        ListViewRow.prototype.getData = function () {
            return this.data;
        };
        ListViewRow.prototype.getSelectionActions = function () {
            return this.selectionActions;
        };
        ListViewRow.prototype.setSelectionActions = function (value) {
            this.selectionActions = value;
        };
        ListViewRow.prototype.onPress = function () {
            this.setIsSelected(!this.getIsSelected());
        };
        ListViewRow.prototype.onSelect = function () {
            this.select();
            this.onStyleChange();
        };
        ListViewRow.prototype.onUnselect = function () {
            this.unselect();
            this.onStyleChange();
        };
        ListViewRow.prototype.measureCore = function (width, height) {
            this.background.measure(width, height);
            var minHeight = 0;
            for (var col = 0; col < this.headers.length; col++) {
                var child = this.cells[col];
                var size = child.measure(0, 0);
                if (size.height > minHeight)
                    minHeight = size.height;
            }
            return { width: 0, height: minHeight };
        };
        ListViewRow.prototype.arrangeCore = function (width, height) {
            this.background.arrange(0, 0, width, height);
            var x = 0;
            for (var col = 0; col < this.headers.length; col++) {
                var header = this.headers[col];
                var cell = this.cells[col];
                var colWidth = header['Ui.ListViewHeadersBar.ui'].layoutWidth;
                cell.arrange(x, 0, colWidth, height);
                x += colWidth;
            }
        };
        ListViewRow.prototype.onStyleChange = function () {
            if (this.getIsSelected())
                this.background.fill = this.getStyleProperty('selectColor');
            else
                this.background.fill = this.getStyleProperty('color');
        };
        ListViewRow.style = {
            color: new Ui.Color(0.99, 0.99, 0.99, 0.1),
            selectColor: new Ui.Color(0.88, 0.88, 0.88)
        };
        return ListViewRow;
    }(Ui.Selectionable));
    Ui.ListViewRow = ListViewRow;
    var ListViewRowOdd = (function (_super) {
        __extends(ListViewRowOdd, _super);
        function ListViewRowOdd() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ListViewRowOdd.style = {
            color: new Ui.Color(0.5, 0.5, 0.5, 0.05),
            selectColor: new Ui.Color(0.88, 0.88, 0.88)
        };
        return ListViewRowOdd;
    }(ListViewRow));
    Ui.ListViewRowOdd = ListViewRowOdd;
    var ListViewRowEven = (function (_super) {
        __extends(ListViewRowEven, _super);
        function ListViewRowEven() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ListViewRowEven.style = {
            color: new Ui.Color(0.5, 0.5, 0.5, 0.1),
            selectColor: new Ui.Color(0.88, 0.88, 0.88)
        };
        return ListViewRowEven;
    }(ListViewRow));
    Ui.ListViewRowEven = ListViewRowEven;
    var ListViewScrollLoader = (function (_super) {
        __extends(ListViewScrollLoader, _super);
        function ListViewScrollLoader(listView, data) {
            var _this = _super.call(this) || this;
            _this.listView = listView;
            _this.data = data;
            return _this;
        }
        ListViewScrollLoader.prototype.signalChange = function () {
            this.fireEvent('change', this);
        };
        ListViewScrollLoader.prototype.getMin = function () {
            return 0;
        };
        ListViewScrollLoader.prototype.getMax = function () {
            return this.data.length - 1;
        };
        ListViewScrollLoader.prototype.getElementAt = function (position) {
            return this.listView.getElementAt(position);
        };
        return ListViewScrollLoader;
    }(Ui.ScrollLoader));
    Ui.ListViewScrollLoader = ListViewScrollLoader;
    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView(config) {
            var _this = _super.call(this) || this;
            _this.rowsHeight = 0;
            _this.headersHeight = 0;
            _this.headersVisible = true;
            _this.sortInvert = false;
            _this.scrolled = true;
            _this.addEvents('select', 'unselect', 'activate', 'header');
            if (config.headers !== undefined) {
                _this.headers = config.headers;
                delete (config.headers);
            }
            else
                _this.headers = [{ width: 100, type: 'string', title: 'Title', key: 'default' }];
            _this.selectionActions = {
                edit: {
                    "default": true,
                    text: 'Edit', icon: 'edit',
                    scope: _this, callback: _this.onSelectionEdit, multiple: false
                }
            };
            _this.headersBar = new ListViewHeadersBar({ headers: _this.headers });
            _this.connect(_this.headersBar, 'header', _this.onHeaderPress);
            _this.append(_this.headersBar);
            _this.data = [];
            _this.dataLoader = new ListViewScrollLoader(_this, _this.data);
            _this.scroll = new Ui.VBoxScrollingArea({ loader: _this.dataLoader });
            _this.append(_this.scroll, true);
            return _this;
        }
        ListView.prototype.setScrolled = function (scrolled) {
            if (this.scrolled !== (scrolled === true)) {
                this.scrolled = scrolled;
                if (this.scrolled) {
                    this.remove(this.vbox);
                    this.scroll = new Ui.VBoxScrollingArea({ loader: this.dataLoader });
                    this.append(this.scroll, true);
                }
                else {
                    this.remove(this.scroll);
                    this.vbox = new Ui.VBox();
                    this.append(this.vbox, true);
                    this.updateData(this.data);
                }
            }
        };
        ListView.prototype.showHeaders = function () {
            if (!this.headersVisible) {
                this.headersVisible = true;
                this.headersBar.show();
            }
        };
        ListView.prototype.hideHeaders = function () {
            if (this.headersVisible) {
                this.headersVisible = false;
                this.headersBar.hide(true);
            }
        };
        ListView.prototype.getSelectionActions = function () {
            return this.selectionActions;
        };
        ListView.prototype.setSelectionActions = function (value) {
            this.selectionActions = value;
        };
        ListView.prototype.getElementAt = function (position) {
            if ((position % 2) === 0)
                return new ListViewRowOdd({
                    headers: this.headers,
                    data: this.data[position], selectionActions: this.selectionActions
                });
            else
                return new ListViewRowEven({
                    headers: this.headers,
                    data: this.data[position], selectionActions: this.selectionActions
                });
        };
        ListView.prototype.appendData = function (data) {
            this.data.push(data);
            this.sortData();
            if (this.scrolled)
                this.dataLoader.signalChange();
            else
                this.vbox.append(this.getElementAt(this.data.length - 1));
        };
        ListView.prototype.updateData = function (data) {
            this.sortData();
            if (this.scrolled)
                this.scroll.reload();
            else {
                this.vbox.clear();
                for (var i = 0; i < this.data.length; i++) {
                    this.vbox.append(this.getElementAt(i));
                }
            }
        };
        ListView.prototype.removeData = function (data) {
            var row = this.findDataRow(data);
            if (row != -1)
                this.removeDataAt(row);
        };
        ListView.prototype.removeDataAt = function (position) {
            if (position < this.data.length) {
                this.data.splice(position, 1);
                if (this.scrolled)
                    this.scroll.reload();
                else {
                    this.vbox.clear();
                    for (var i = 0; i < this.data.length; i++) {
                        this.vbox.append(this.getElementAt(i));
                    }
                }
            }
        };
        ListView.prototype.clearData = function () {
            this.data = [];
            this.dataLoader = new ListViewScrollLoader(this, this.data);
            if (this.scrolled)
                this.scroll.loader = this.dataLoader;
            else
                this.vbox.clear();
        };
        ListView.prototype.getData = function () {
            return this.data;
        };
        ListView.prototype.setData = function (data) {
            if (data !== undefined) {
                this.data = data;
                this.sortData();
                this.dataLoader = new ListViewScrollLoader(this, this.data);
                if (this.scrolled)
                    this.scroll.loader = this.dataLoader;
                else {
                    this.vbox.clear();
                    for (var i = 0; i < this.data.length; i++) {
                        this.vbox.append(this.getElementAt(i));
                    }
                }
            }
            else {
                this.clearData();
            }
        };
        ListView.prototype.sortData = function () {
            var key = this.sortColKey;
            var invert = this.sortInvert;
            this.data.sort(function (a, b) {
                var res;
                if (a[key] < b[key])
                    res = -1;
                else if (a[key] > b[key])
                    res = 1;
                else
                    res = 0;
                return invert ? -res : res;
            });
        };
        ListView.prototype.sortBy = function (key, invert) {
            this.sortColKey = key;
            this.sortInvert = invert === true;
            this.headersBar.sortBy(this.sortColKey, this.sortInvert);
            this.sortData();
            if (this.scrolled) {
                this.scroll.reload();
                this.invalidateArrange();
            }
            else {
                this.vbox.clear();
                for (var i = 0; i < this.data.length; i++) {
                    this.vbox.append(this.getElementAt(i));
                }
            }
        };
        ListView.prototype.findDataRow = function (data) {
            for (var row = 0; row < this.data.length; row++) {
                if (data == this.data[row])
                    return row;
            }
            return -1;
        };
        ListView.prototype.onHeaderPress = function (header, key) {
            this.sortBy(key, (this.sortColKey === key) ? !this.sortInvert : false);
        };
        ListView.prototype.onSelectionEdit = function (selection) {
            var data = selection.getElements()[0].getData();
            this.fireEvent('activate', this, this.findDataRow(data), data);
        };
        ListView.prototype.onChildInvalidateArrange = function (child) {
            _super.prototype.onChildInvalidateArrange.call(this, child);
            if (child === this.headersBar) {
                if (this.scrolled && (this.scroll !== undefined))
                    this.scroll.getActiveItems().forEach(function (item) { item.invalidateArrange(); });
                else if (!this.scrolled)
                    this.vbox.children.forEach(function (item) { item.invalidateArrange(); });
            }
        };
        return ListView;
    }(Ui.VBox));
    Ui.ListView = ListView;
    var ListViewCell = (function (_super) {
        __extends(ListViewCell, _super);
        function ListViewCell() {
            var _this = _super.call(this) || this;
            _this.clipToBounds = true;
            _this.ui = _this.generateUi();
            _this.append(_this.ui);
            return _this;
        }
        ListViewCell.prototype.getKey = function () {
            return this.key;
        };
        ListViewCell.prototype.setKey = function (key) {
            this.key = key;
        };
        ListViewCell.prototype.getValue = function () {
            return this.value;
        };
        ListViewCell.prototype.setValue = function (value) {
            if (this.value !== value) {
                this.value = value;
                this.onValueChange(value);
            }
        };
        ListViewCell.prototype.generateUi = function () {
            return new Ui.Label({ margin: 8, horizontalAlign: 'left' });
        };
        ListViewCell.prototype.onValueChange = function (value) {
            this.ui.text = value;
        };
        ListViewCell.prototype.onStyleChange = function () {
            var spacing = this.getStyleProperty('spacing');
            this.ui.margin = spacing + 2;
        };
        ListViewCell.style = {
            spacing: 5
        };
        return ListViewCell;
    }(Ui.LBox));
    Ui.ListViewCell = ListViewCell;
    var ListViewCellString = (function (_super) {
        __extends(ListViewCellString, _super);
        function ListViewCellString() {
            return _super.call(this) || this;
        }
        ListViewCellString.prototype.generateUi = function () {
            return new Ui.Label({ margin: 8, horizontalAlign: 'left' });
        };
        ListViewCellString.prototype.onValueChange = function (value) {
            this.ui.text = value;
        };
        return ListViewCellString;
    }(ListViewCell));
    Ui.ListViewCellString = ListViewCellString;
    var ListViewColBar = (function (_super) {
        __extends(ListViewColBar, _super);
        function ListViewColBar(header) {
            var _this = _super.call(this) || this;
            _this.headerHeight = 0;
            _this.header = header;
            _this.grip = new Ui.Movable({ moveVertical: false });
            _this.appendChild(_this.grip);
            _this.connect(_this.grip, 'move', _this.onMove);
            _this.connect(_this.grip, 'up', _this.onUp);
            var lbox = new Ui.LBox();
            _this.grip.setContent(lbox);
            lbox.append(new Ui.Rectangle({ width: 1, opacity: 0.2, fill: 'black', marginLeft: 14, marginRight: 8 + 2, marginTop: 6, marginBottom: 6 }));
            lbox.append(new Ui.Rectangle({ width: 1, opacity: 0.2, fill: 'black', marginLeft: 19, marginRight: 3 + 2, marginTop: 6, marginBottom: 6 }));
            _this.separator = new Ui.Rectangle({ width: 1, fill: 'black', opacity: 0.3 });
            _this.appendChild(_this.separator);
            return _this;
        }
        ListViewColBar.prototype.setHeader = function (header) {
            this.header = header;
        };
        ListViewColBar.prototype.setHeaderHeight = function (height) {
            this.headerHeight = height;
        };
        ListViewColBar.prototype.onMove = function () {
            this.separator.transform = Ui.Matrix.createTranslate(this.grip.positionX, 0);
        };
        ListViewColBar.prototype.onUp = function () {
            var delta = this.grip.positionX;
            this.header.width = Math.max(this.measureWidth, this.header.measureWidth + delta);
            this.invalidateArrange();
        };
        ListViewColBar.prototype.measureCore = function (width, height) {
            var size = this.grip.measure(width, height);
            this.separator.measure(width, height);
            return { width: size.width, height: 0 };
        };
        ListViewColBar.prototype.arrangeCore = function (width, height) {
            this.grip.setPosition(0, 0);
            this.separator.transform = Ui.Matrix.createTranslate(0, 0);
            this.grip.arrange(0, 0, width, this.headerHeight);
            this.separator.arrange(width - 1, 0, 1, height);
        };
        ListViewColBar.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.grip.hide();
        };
        ListViewColBar.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.grip.show();
        };
        return ListViewColBar;
    }(Ui.Container));
    Ui.ListViewColBar = ListViewColBar;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Uploadable = (function (_super) {
        __extends(Uploadable, _super);
        function Uploadable(config) {
            var _this = _super.call(this) || this;
            _this.drawing.style.cursor = 'pointer';
            _this.focusable = true;
            _this.role = 'button';
            _this.addEvents('file');
            _this.input = new UploadableFileWrapper();
            _this.append(_this.input);
            _this.connect(_this.input, 'file', _this.onFile);
            return _this;
        }
        Uploadable.prototype.setDirectoryMode = function (active) {
            this.input.setDirectoryMode(active);
        };
        Uploadable.prototype.onFile = function (fileWrapper, file) {
            this.fireEvent('file', this, file);
        };
        Uploadable.prototype.onPress = function () {
            if (this.input instanceof UploadableFileWrapper)
                this.input.select();
        };
        Object.defineProperty(Uploadable.prototype, "content", {
            set: function (content) {
                if (this._content !== content) {
                    if (this._content !== undefined)
                        this.remove(this._content);
                    if (content !== undefined) {
                        if (this.input instanceof Ui.UploadableWrapper)
                            this.prepend(content);
                        else
                            this.append(content);
                    }
                    this._content = content;
                }
            },
            enumerable: true,
            configurable: true
        });
        return Uploadable;
    }(Ui.Pressable));
    Ui.Uploadable = Uploadable;
    var UploadableFileWrapper = (function (_super) {
        __extends(UploadableFileWrapper, _super);
        function UploadableFileWrapper() {
            var _this = _super.call(this) || this;
            _this.opacity = 0;
            _this.clipToBounds = true;
            _this.addEvents('file');
            return _this;
        }
        UploadableFileWrapper.prototype.select = function () {
            this.inputDrawing.click();
        };
        UploadableFileWrapper.prototype.setDirectoryMode = function (active) {
            this.directoryMode = active;
            if (this.inputDrawing !== undefined) {
                if (this.directoryMode)
                    this.inputDrawing.setAttribute('webkitdirectory', '');
                else
                    this.inputDrawing.removeAttribute('webkitdirectory');
            }
        };
        UploadableFileWrapper.prototype.createInput = function () {
            this.formDrawing = document.createElement('form');
            this.connect(this.formDrawing, 'click', function (e) {
                e.stopPropagation();
            });
            this.connect(this.formDrawing, 'touchstart', function (e) {
                e.stopPropagation();
            });
            this.formDrawing.method = 'POST';
            this.formDrawing.enctype = 'multipart/form-data';
            this.formDrawing.encoding = 'multipart/form-data';
            this.formDrawing.style.position = 'absolute';
            this.inputDrawing = document.createElement('input');
            this.inputDrawing.type = 'file';
            this.inputDrawing.setAttribute('name', 'file');
            if (this.directoryMode)
                this.inputDrawing.setAttribute('webkitdirectory', '');
            this.inputDrawing.style.position = 'absolute';
            this.inputDrawing.tabIndex = -1;
            this.connect(this.inputDrawing, 'change', this.onChange);
            this.formDrawing.appendChild(this.inputDrawing);
            if (Core.Navigator.supportFileAPI) {
                while (this.drawing.childNodes.length > 0)
                    this.drawing.removeChild(this.drawing.childNodes[0]);
                this.drawing.appendChild(this.formDrawing);
                this.arrange(this.layoutX, this.layoutY, this.layoutWidth, this.layoutHeight);
            }
            else {
                this.iframeDrawing = document.createElement('iframe');
                this.iframeDrawing.style.position = 'absolute';
                this.iframeDrawing.style.top = '0px';
                this.iframeDrawing.style.left = '0px';
                this.iframeDrawing.style.width = '0px';
                this.iframeDrawing.style.height = '0px';
                this.iframeDrawing.style.clip = 'rect(0px 0px 0px 0px)';
                document.body.appendChild(this.iframeDrawing);
                this.iframeDrawing.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");
                this.iframeDrawing.contentWindow.document.body.appendChild(this.formDrawing);
            }
        };
        UploadableFileWrapper.prototype.onChange = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (Core.Navigator.supportFileAPI) {
                for (var i = 0; i < this.inputDrawing.files.length; i++)
                    this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
            }
            else {
                this.disconnect(this.inputDrawing, 'change', this.onChange);
                var file = new Core.File({ iframe: this.iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing });
                this.createInput();
                this.fireEvent('file', this, file);
            }
        };
        UploadableFileWrapper.prototype.onLoad = function () {
            _super.prototype.onLoad.call(this);
            this.createInput();
        };
        UploadableFileWrapper.prototype.onUnload = function () {
            this.disconnect(this.inputDrawing, 'change', this.onChange);
            if (this.iframeDrawing !== undefined)
                document.body.removeChild(this.iframeDrawing);
            _super.prototype.onUnload.call(this);
        };
        UploadableFileWrapper.prototype.arrangeCore = function (w, h) {
            _super.prototype.arrangeCore.call(this, w, h);
            if (this.formDrawing !== undefined) {
                this.formDrawing.style.top = '0px';
                this.formDrawing.style.left = '0px';
                this.formDrawing.style.width = Math.round(w) + 'px';
                this.formDrawing.style.height = Math.round(h) + 'px';
            }
            if (this.inputDrawing !== undefined) {
                this.inputDrawing.style.top = '0px';
                this.inputDrawing.style.left = '0px';
                this.inputDrawing.style.width = Math.round(w) + 'px';
                this.inputDrawing.style.height = Math.round(h) + 'px';
            }
        };
        return UploadableFileWrapper;
    }(Ui.Element));
    Ui.UploadableFileWrapper = UploadableFileWrapper;
    var UploadableWrapper = (function (_super) {
        __extends(UploadableWrapper, _super);
        function UploadableWrapper() {
            var _this = _super.call(this) || this;
            _this.directoryMode = false;
            _this.clipToBounds = true;
            _this.opacity = 0;
            _this.addEvents('file');
            return _this;
        }
        UploadableWrapper.prototype.setDirectoryMode = function (active) {
        };
        UploadableWrapper.prototype.createInput = function () {
            this.formDrawing = document.createElement('form');
            this.formDrawing.method = 'POST';
            this.formDrawing.enctype = 'multipart/form-data';
            this.formDrawing.encoding = 'multipart/form-data';
            this.formDrawing.style.display = 'block';
            this.formDrawing.style.position = 'absolute';
            this.formDrawing.style.left = '0px';
            this.formDrawing.style.top = '0px';
            this.formDrawing.style.width = this.layoutWidth + 'px';
            this.formDrawing.style.height = this.layoutHeight + 'px';
            this.inputDrawing = document.createElement('input');
            this.inputDrawing.type = 'file';
            this.inputDrawing.name = 'file';
            this.inputDrawing.tabIndex = -1;
            this.inputDrawing.style.fontSize = '200px';
            this.inputDrawing.style.display = 'block';
            this.inputDrawing.style.cursor = 'pointer';
            this.inputDrawing.style.position = 'absolute';
            this.inputDrawing.style.left = '0px';
            this.inputDrawing.style.top = '0px';
            this.inputDrawing.style.width = this.layoutWidth + 'px';
            this.inputDrawing.style.height = this.layoutHeight + 'px';
            this.formDrawing.appendChild(this.inputDrawing);
            this.connect(this.inputDrawing, 'change', this.onChange);
            if (Core.Navigator.isWebkit)
                this.inputDrawing.style.webkitUserSelect = 'none';
            this.connect(this.inputDrawing, 'touchstart', function (event) {
                event.dontPreventDefault = true;
            });
            this.connect(this.inputDrawing, 'touchend', function (event) {
                event.dontPreventDefault = true;
            });
            return this.formDrawing;
        };
        UploadableWrapper.prototype.onChange = function (event) {
            if (!Core.Navigator.isOpera && Core.Navigator.supportFileAPI) {
                for (var i = 0; i < this.inputDrawing.files.length; i++)
                    this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
            }
            else {
                this.drawing.removeChild(this.formDrawing);
                var iframeDrawing = document.createElement('iframe');
                iframeDrawing.style.position = 'absolute';
                iframeDrawing.style.top = '0px';
                iframeDrawing.style.left = '0px';
                iframeDrawing.style.width = '0px';
                iframeDrawing.style.height = '0px';
                iframeDrawing.style.clip = 'rect(0px 0px 0px 0px)';
                document.body.appendChild(iframeDrawing);
                iframeDrawing.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");
                iframeDrawing.contentWindow.document.body.appendChild(this.formDrawing);
                this.disconnect(this.inputDrawing, 'change', this.onChange);
                this.fireEvent('file', this, new Core.File({ iframe: iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing }));
                this.drawing.appendChild(this.createInput());
            }
        };
        UploadableWrapper.prototype.renderDrawing = function () {
            var drawing = _super.prototype.renderDrawing.call(this);
            drawing.appendChild(this.createInput());
        };
        UploadableWrapper.prototype.arrangeCore = function (width, height) {
            this.formDrawing.style.width = Math.round(width) + 'px';
            this.formDrawing.style.height = Math.round(height) + 'px';
            this.inputDrawing.style.width = Math.round(width) + 'px';
            this.inputDrawing.style.height = Math.round(height) + 'px';
        };
        return UploadableWrapper;
    }(Ui.Element));
    Ui.UploadableWrapper = UploadableWrapper;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var UploadButton = (function (_super) {
        __extends(UploadButton, _super);
        function UploadButton(init) {
            var _this = _super.call(this) || this;
            _this.addEvents('file');
            _this.input = new Ui.UploadableFileWrapper();
            _this.prepend(_this.input);
            _this.connect(_this.input, 'file', _this.onFile);
            _this.connect(_this, 'press', _this.onUploadButtonPress);
            _this.dropBox.addType('files', 'copy');
            _this.connect(_this.dropBox, 'dropfile', _this.onFile);
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(UploadButton.prototype, "directoryMode", {
            set: function (active) {
                this.input.setDirectoryMode(active);
            },
            enumerable: true,
            configurable: true
        });
        UploadButton.prototype.onUploadButtonPress = function () {
            this.input.select();
        };
        UploadButton.prototype.onFile = function (fileWrapper, file) {
            this.fireEvent('file', this, file);
        };
        return UploadButton;
    }(Ui.Button));
    Ui.UploadButton = UploadButton;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Transition = (function (_super) {
        __extends(Transition, _super);
        function Transition() {
            return _super.call(this) || this;
        }
        Transition.prototype.run = function (current, next, progress) {
            throw ('transition classes MUST override run method');
        };
        Transition.register = function (transitionName, classType) {
            this.transitions[transitionName] = classType;
        };
        Transition.parse = function (transition) {
            return new this.transitions[transition]();
        };
        Transition.create = function (transition) {
            if (transition instanceof Transition)
                return transition;
            return new this.transitions[transition]();
        };
        Transition.transitions = {};
        return Transition;
    }(Core.Object));
    Ui.Transition = Transition;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Fade = (function (_super) {
        __extends(Fade, _super);
        function Fade() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Fade.prototype.run = function (current, next, progress) {
            if (current !== undefined) {
                if (progress == 1) {
                    current.hide();
                    current.opacity = 1;
                }
                else
                    current.opacity = Math.min(1, Math.max(0, 1 - progress * 3));
            }
            if (next !== undefined)
                next.opacity = progress;
        };
        return Fade;
    }(Ui.Transition));
    Ui.Fade = Fade;
})(Ui || (Ui = {}));
Ui.Transition.register('fade', Ui.Fade);
var Ui;
(function (Ui) {
    var Slide = (function (_super) {
        __extends(Slide, _super);
        function Slide(init) {
            var _this = _super.call(this) || this;
            _this._direction = 'right';
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(Slide.prototype, "direction", {
            set: function (direction) {
                this._direction = direction;
            },
            enumerable: true,
            configurable: true
        });
        Slide.prototype.run = function (current, next, progress) {
            if (current !== undefined) {
                if (progress === 1) {
                    current.hide();
                    current.setTransformOrigin(0, 0);
                    current.transform = undefined;
                }
                else {
                    current.setTransformOrigin(0, 0);
                    if (this._direction == 'right')
                        current.transform = Ui.Matrix.createTranslate(-current.layoutWidth * progress, 0);
                    else if (this._direction == 'left')
                        current.transform = Ui.Matrix.createTranslate(current.layoutWidth * progress, 0);
                    else if (this._direction == 'top')
                        current.transform = Ui.Matrix.createTranslate(0, current.layoutHeight * progress);
                    else
                        current.transform = Ui.Matrix.createTranslate(0, -current.layoutHeight * progress);
                }
            }
            if (next !== undefined) {
                if (progress === 1) {
                    next.setTransformOrigin(0, 0);
                    next.transform = undefined;
                }
                else {
                    next.setTransformOrigin(0, 0);
                    if (this._direction == 'right')
                        next.transform = Ui.Matrix.createTranslate(next.layoutWidth * (1 - progress), 0);
                    else if (this._direction == 'left')
                        next.transform = Ui.Matrix.createTranslate(-next.layoutWidth * (1 - progress), 0);
                    else if (this._direction == 'top')
                        next.transform = Ui.Matrix.createTranslate(0, -next.layoutHeight * (1 - progress));
                    else
                        next.transform = Ui.Matrix.createTranslate(0, next.layoutHeight * (1 - progress));
                }
            }
        };
        return Slide;
    }(Ui.Transition));
    Ui.Slide = Slide;
})(Ui || (Ui = {}));
Ui.Transition.register('slide', Ui.Slide);
var Ui;
(function (Ui) {
    var Flip = (function (_super) {
        __extends(Flip, _super);
        function Flip(init) {
            var _this = _super.call(this) || this;
            _this.orientation = 'horizontal';
            if (init)
                _this.assign(init);
            return _this;
        }
        Flip.prototype.run = function (current, next, progress) {
            if (progress < 0.5) {
                if (current !== undefined) {
                    current.setTransformOrigin(0.5, 0.5);
                    if (this.orientation == 'horizontal')
                        current.transform = Ui.Matrix.createScale((1 - progress * 2), 1);
                    else
                        current.transform = Ui.Matrix.createScale(1, (1 - progress * 2));
                }
                if (next !== undefined)
                    next.hide();
            }
            else {
                if (current !== undefined) {
                    current.hide();
                    current.setTransformOrigin(0, 0);
                    current.transform = undefined;
                }
                if (next !== undefined) {
                    if (progress == 1) {
                        next.show();
                        next.setTransformOrigin(0, 0);
                        next.transform = undefined;
                    }
                    else {
                        next.show();
                        next.setTransformOrigin(0.5, 0.5);
                        if (this.orientation == 'horizontal')
                            next.transform = Ui.Matrix.createScale((progress - 0.5) * 2, 1);
                        else
                            next.transform = Ui.Matrix.createScale(1, (progress - 0.5) * 2);
                    }
                }
            }
        };
        return Flip;
    }(Ui.Transition));
    Ui.Flip = Flip;
})(Ui || (Ui = {}));
Ui.Transition.register('flip', Ui.Flip);
var Ui;
(function (Ui) {
    var TransitionBox = (function (_super) {
        __extends(TransitionBox, _super);
        function TransitionBox(init) {
            var _this = _super.call(this) || this;
            _this._duration = 0.5;
            _this._position = -1;
            _this.replaceMode = false;
            _this.addEvents('change');
            _this.connect(_this, 'load', _this.onTransitionBoxLoad);
            _this.connect(_this, 'unload', _this.onTransitionBoxUnload);
            _this.clipToBounds = true;
            _this.transition = 'fade';
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(TransitionBox.prototype, "position", {
            get: function () {
                return this._position;
            },
            set: function (position) {
                this.setCurrentAt(position);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TransitionBox.prototype, "duration", {
            set: function (duration) {
                this._duration = duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TransitionBox.prototype, "ease", {
            set: function (ease) {
                this._ease = Anim.EasingFunction.create(ease);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TransitionBox.prototype, "transition", {
            set: function (transition) {
                this._transition = Ui.Transition.create(transition);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TransitionBox.prototype, "current", {
            get: function () {
                if (this._position == -1)
                    return undefined;
                else
                    return this.children[this._position].children[0];
            },
            set: function (child) {
                var pos = this.getChildPosition(child);
                if (pos != -1)
                    this.setCurrentAt(pos);
            },
            enumerable: true,
            configurable: true
        });
        TransitionBox.prototype.setCurrentAt = function (position) {
            if (this._position != position) {
                if (this.next !== undefined) {
                    if (this._current !== undefined) {
                        this._current.hide();
                        this._current = this.next;
                        this._current.show();
                        this.next = undefined;
                    }
                }
                if (this.transitionClock !== undefined) {
                    this.disconnect(this.transitionClock, 'complete', this.onTransitionComplete);
                    this.transitionClock.stop();
                }
                if (this._position != -1)
                    this._current = this.children[this._position];
                else
                    this._current = undefined;
                this.next = this.children[position];
                this.next.show();
                this._transition.run(this._current, this.next, 0);
                this.transitionClock = new Anim.Clock({ duration: this._duration, ease: this._ease });
                this.connect(this.transitionClock, 'timeupdate', this.onTransitionTick);
                this.connect(this.transitionClock, 'complete', this.onTransitionComplete);
                this.transitionClock.begin();
                this._position = position;
            }
        };
        TransitionBox.prototype.replaceContent = function (content) {
            this.replaceMode = true;
            this.append(content);
            this.current = content;
        };
        TransitionBox.prototype.onTransitionBoxLoad = function () {
        };
        TransitionBox.prototype.onTransitionBoxUnload = function () {
            if (this.transitionClock !== undefined) {
                this.transitionClock.stop();
                this.transitionClock = undefined;
            }
        };
        TransitionBox.prototype.onTransitionTick = function (clock, progress) {
            this.progress = progress;
            this._transition.run(this._current, this.next, progress);
        };
        TransitionBox.prototype.onTransitionComplete = function (clock) {
            var i;
            this.transitionClock = undefined;
            var current = this.next;
            if (this._current !== undefined)
                this._current.hide();
            this.next = undefined;
            if (this.replaceMode) {
                this.replaceMode = false;
                var removeList = [];
                for (i = 0; i < this.children.length; i++) {
                    var item = this.children[i];
                    if (item !== current)
                        removeList.push(item.firstChild);
                }
                for (i = 0; i < removeList.length; i++)
                    this.remove(removeList[i]);
            }
            this.fireEvent('change', this, this._position);
        };
        TransitionBox.prototype.arrangeCore = function (width, height) {
            _super.prototype.arrangeCore.call(this, width, height);
            if (this.transitionClock !== undefined)
                this._transition.run(this._current, this.next, this.transitionClock.progress);
        };
        TransitionBox.prototype.append = function (child) {
            var content = new TransitionBoxContent();
            content.append(child);
            content.hide();
            _super.prototype.append.call(this, content);
        };
        TransitionBox.prototype.prepend = function (child) {
            if (this._position !== -1)
                this._position++;
            var content = new TransitionBoxContent();
            content.append(child);
            content.hide();
            _super.prototype.prepend.call(this, child);
        };
        TransitionBox.prototype.remove = function (child) {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].firstChild == child) {
                    if (i < this._position)
                        this._position--;
                    else if (i == this._position)
                        this._position = -1;
                    this.children[i].remove(child);
                    _super.prototype.remove.call(this, this.children[i]);
                    break;
                }
            }
        };
        TransitionBox.prototype.getChildPosition = function (child) {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].children[0] == child)
                    return i;
            }
            return -1;
        };
        return TransitionBox;
    }(Ui.LBox));
    Ui.TransitionBox = TransitionBox;
    var TransitionBoxContent = (function (_super) {
        __extends(TransitionBoxContent, _super);
        function TransitionBoxContent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TransitionBoxContent;
    }(Ui.LBox));
    Ui.TransitionBoxContent = TransitionBoxContent;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Fold = (function (_super) {
        __extends(Fold, _super);
        function Fold(init) {
            var _this = _super.call(this, init) || this;
            _this._offset = 0;
            _this._position = 'bottom';
            _this._isFolded = true;
            _this._over = true;
            _this._mode = 'extend';
            _this.contentSize = 0;
            _this._animDuration = 2;
            _this.addEvents('fold', 'unfold', 'positionchange');
            _this.headerBox = new Ui.LBox();
            _this.appendChild(_this.headerBox);
            _this.contentBox = new Ui.LBox();
            _this.appendChild(_this.contentBox);
            _this.contentBox.hide();
            return _this;
        }
        Object.defineProperty(Fold.prototype, "isFolded", {
            get: function () {
                return this._isFolded;
            },
            set: function (isFolded) {
                if (this._isFolded != isFolded) {
                    this._isFolded = isFolded;
                    if (this._isFolded) {
                        this.offset = 0;
                        this.contentBox.hide();
                        this.fireEvent('fold', this);
                    }
                    else {
                        this.offset = 1;
                        this.contentBox.show();
                        this.fireEvent('unfold', this);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Fold.prototype.fold = function () {
            if (!this._isFolded) {
                this._isFolded = true;
                this.startAnimation();
                this.fireEvent('fold', this);
            }
        };
        Fold.prototype.unfold = function () {
            if (this._isFolded) {
                this._isFolded = false;
                this.startAnimation();
                this.fireEvent('unfold', this);
            }
        };
        Object.defineProperty(Fold.prototype, "over", {
            get: function () {
                return this._over;
            },
            set: function (over) {
                if (this._over != over) {
                    this._over = over;
                    this.stopAnimation();
                    this.transform = Ui.Matrix.createTranslate(0, 0);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "mode", {
            get: function () {
                return this._mode;
            },
            set: function (mode) {
                if (this._mode != mode) {
                    this._mode = mode;
                    this.stopAnimation();
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "header", {
            get: function () {
                return this._header;
            },
            set: function (header) {
                if (header !== this._header) {
                    this._header = header;
                    this.headerBox.content = this._header;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "content", {
            get: function () {
                return this._content;
            },
            set: function (content) {
                if (this._content !== content) {
                    this._content = content;
                    this.contentBox.content = this._content;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "background", {
            get: function () {
                return this._background;
            },
            set: function (background) {
                if (this._background !== background) {
                    if (this._background !== undefined)
                        this.removeChild(this._background);
                    this._background = background;
                    if (this._background !== undefined)
                        this.prependChild(this._background);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "position", {
            get: function () {
                return this._position;
            },
            set: function (position) {
                if (this._position != position) {
                    this._position = position;
                    this.fireEvent('positionchange', this, position);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Fold.prototype.invert = function () {
            if (this._isFolded)
                this.unfold();
            else
                this.fold();
        };
        Object.defineProperty(Fold.prototype, "animDuration", {
            get: function () {
                return this._animDuration;
            },
            set: function (duration) {
                this._animDuration = duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fold.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            set: function (offset) {
                if (this._offset === offset)
                    return;
                this._offset = offset;
                if (!this._over)
                    this.invalidateMeasure();
                else {
                    if (this._position === 'right') {
                        if (this._mode === 'slide')
                            this.transform = Ui.Matrix.createTranslate(-this._offset * this.contentSize, 0);
                        else
                            this.transform = Ui.Matrix.createTranslate(0, 0);
                        this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize * this._offset), this.layoutHeight);
                        if (this._background !== undefined)
                            this._background.arrange(0, 0, Math.round(this.headerBox.measureWidth + this.contentSize * this._offset), Math.round(this.layoutHeight));
                    }
                    else if (this._position === 'left') {
                        if (this._mode === 'slide')
                            this.transform = Ui.Matrix.createTranslate(-this.contentSize + (this._offset * this.contentSize), 0);
                        else
                            this.transform = Ui.Matrix.createTranslate(-this.contentSize, 0);
                        this.contentBox.setClipRectangle(Math.round(this.contentSize * (1 - this._offset)), 0, this.contentSize, this.layoutHeight);
                        if (this._background !== undefined)
                            this._background.arrange(Math.round(this.contentSize * (1 - this._offset)), 0, Math.round(this.headerBox.measureWidth + this.contentSize * this._offset), Math.round(this.layoutHeight));
                    }
                    else if (this._position === 'top') {
                        if (this._mode === 'slide')
                            this.transform = Ui.Matrix.createTranslate(0, -this.contentSize + (this._offset * this.contentSize));
                        else
                            this.transform = Ui.Matrix.createTranslate(0, -this.contentSize);
                        this.contentBox.setClipRectangle(0, Math.round(this.contentSize * (1 - this._offset)), this.layoutWidth, Math.round(this.contentSize * this._offset));
                        if (this._background !== undefined)
                            this._background.arrange(0, Math.round(this.contentSize * (1 - this._offset)), this.layoutWidth, Math.round(this.headerBox.measureHeight + this.contentSize * this._offset));
                    }
                    else {
                        if (this._mode === 'slide')
                            this.transform = Ui.Matrix.createTranslate(0, -this._offset * this.contentSize);
                        else
                            this.transform = Ui.Matrix.createTranslate(0, 0);
                        this.contentBox.setClipRectangle(0, 0, this.layoutWidth, Math.round(this.contentSize * this._offset));
                        if (this._background !== undefined)
                            this._background.arrange(0, 0, this.layoutWidth, Math.round(this.headerBox.measureHeight + this.contentSize * this._offset));
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Fold.prototype.startAnimation = function () {
            if (this.clock !== undefined)
                this.clock.stop();
            if (!this._isFolded)
                this.contentBox.show();
            this.clock = new Anim.Clock({ duration: this._animDuration, target: this });
            this.connect(this.clock, 'timeupdate', this.onClockTick);
            this.clock.begin();
        };
        Fold.prototype.stopAnimation = function () {
            if (this.clock !== undefined) {
                this.clock.stop();
                this.clock = undefined;
            }
        };
        Fold.prototype.onClockTick = function (clock, progress) {
            if (this.content === undefined) {
                if (this.clock !== undefined) {
                    this.clock.stop();
                    this.clock = undefined;
                }
                return;
            }
            var offset = this.offset;
            if (offset > 1)
                this.offset = 1;
            else {
                var destOffset = void 0;
                if (this._isFolded)
                    destOffset = 0;
                else
                    destOffset = 1;
                this.offset = destOffset - ((destOffset - offset) * (1 - progress));
            }
            if ((progress == 1) && this._isFolded) {
                this.contentBox.hide();
            }
        };
        Fold.prototype.measureCore = function (width, height) {
            if (this._background !== undefined)
                this._background.measure(width, height);
            var size = this.headerBox.measure(width, height);
            var contentSize = { width: 0, height: 0 };
            if ((this._position == 'left') || (this._position == 'right')) {
                contentSize = this.contentBox.measure(width - size.width, height);
                if (contentSize.height > size.height)
                    size.height = contentSize.height;
                if (!this._over)
                    size.width += contentSize.width * this._offset;
                this.contentSize = contentSize.width;
            }
            else {
                contentSize = this.contentBox.measure(width, height - size.height);
                if (contentSize.width > size.width)
                    size.width = contentSize.width;
                if (!this._over)
                    size.height += contentSize.height * this._offset;
                this.contentSize = contentSize.height;
            }
            return size;
        };
        Fold.prototype.arrangeCore = function (width, height) {
            if (this._position == 'left') {
                if (!this._over)
                    this.transform = Ui.Matrix.createTranslate(-this.contentSize + (this._offset * this.contentSize), 0);
                this.contentBox.arrange(0, 0, this.contentBox.measureWidth, height);
                this.headerBox.arrange(this.contentBox.measureWidth, 0, this.headerBox.measureWidth, height);
                if (this._background !== undefined)
                    this._background.arrange(Math.round(this.contentSize * (1 - this._offset)), 0, Math.round(this.headerBox.measureWidth + this.contentSize * this._offset), Math.round(height));
                this.contentBox.setClipRectangle(Math.round(this.contentSize * (1 - this._offset)), 0, Math.round(this.contentSize * this._offset), Math.round(height));
            }
            else if (this._position == 'right') {
                this.headerBox.arrange(0, 0, this.headerBox.measureWidth, height);
                this.contentBox.arrange(this.headerBox.measureWidth, 0, this.contentBox.measureWidth, height);
                if (this._background !== undefined)
                    this._background.arrange(0, 0, Math.round(this.headerBox.measureWidth + this.contentSize * this._offset), Math.round(height));
                this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize * this._offset), Math.round(height));
            }
            else if (this._position == 'top') {
                if (!this._over)
                    this.transform = Ui.Matrix.createTranslate(0, -this.contentSize + (this._offset * this.contentSize));
                this.contentBox.arrange(0, 0, width, this.contentBox.measureHeight);
                this.headerBox.arrange(0, this.contentBox.measureHeight, width, this.headerBox.measureHeight);
                if (this._background !== undefined)
                    this._background.arrange(0, Math.round(this.contentSize * (1 - this._offset)), width, Math.round(this.headerBox.measureHeight + this.contentSize * this._offset));
                this.contentBox.setClipRectangle(0, Math.round(this.contentSize * (1 - this._offset)), Math.round(width), Math.round(this.contentSize * this._offset));
            }
            else {
                this.headerBox.arrange(0, 0, width, this.headerBox.measureHeight);
                this.contentBox.arrange(0, this.headerBox.measureHeight, width, this.contentBox.measureHeight);
                if (this._background !== undefined)
                    this._background.arrange(0, 0, width, Math.round(this.headerBox.measureHeight + this.contentSize * this._offset));
                this.contentBox.setClipRectangle(0, 0, Math.round(width), Math.round(this.contentSize * this._offset));
            }
            this.offset = this._offset;
        };
        return Fold;
    }(Ui.Container));
    Ui.Fold = Fold;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Switch = (function (_super) {
        __extends(Switch, _super);
        function Switch(init) {
            var _this = _super.call(this, init) || this;
            _this._value = false;
            _this.pos = 0;
            _this.speed = 0;
            _this.animNext = 0;
            _this.animStart = 0;
            _this.addEvents('change');
            _this.background = new Ui.Rectangle({ width: 4, height: 14, radius: 7 });
            _this.appendChild(_this.background);
            _this.bar = new Ui.Rectangle({ width: 4, height: 14, radius: 7 });
            _this.appendChild(_this.bar);
            _this.button = new Ui.Movable({ moveVertical: false });
            _this.appendChild(_this.button);
            _this.connect(_this.button, 'move', _this.onButtonMove);
            _this.connect(_this.button, 'focus', _this.updateColors);
            _this.connect(_this.button, 'blur', _this.updateColors);
            _this.connect(_this.button, 'down', _this.onDown);
            _this.connect(_this.button, 'up', _this.onUp);
            _this.buttonContent = new Ui.Rectangle({ radius: 10, width: 20, height: 20, margin: 10 });
            _this.button.setContent(_this.buttonContent);
            _this.ease = new Anim.PowerEase({ mode: 'out' });
            return _this;
        }
        Object.defineProperty(Switch.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (this._value !== value) {
                    this._value = value;
                    if (this.isLoaded) {
                        if (this._value)
                            this.startAnimation(4);
                        else
                            this.startAnimation(-4);
                    }
                    else
                        this.pos = this._value ? 1 : 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        Switch.prototype.onButtonMove = function (button) {
            var pos = this.button.positionX;
            var size = this.layoutWidth;
            var max = size - this.button.layoutWidth;
            if (pos < 0)
                pos = 0;
            else if (pos > max)
                pos = max;
            this.pos = pos / max;
            this.disconnect(this.button, 'move', this.onButtonMove);
            this.updatePos();
            this.connect(this.button, 'move', this.onButtonMove);
        };
        Switch.prototype.updatePos = function () {
            var max;
            var width = this.layoutWidth;
            var height = this.layoutHeight;
            max = width - this.button.layoutWidth;
            this.button.setPosition(max * this.pos, 0);
            this.bar.arrange(this.button.layoutWidth / 2, (height - this.bar.measureHeight) / 2, max * this.pos, this.bar.measureHeight);
        };
        Switch.prototype.getColor = function () {
            return Ui.Color.create(this.getStyleProperty('background')).getYuv();
        };
        Switch.prototype.getForeground = function () {
            return Ui.Color.create(this.getStyleProperty('foreground'));
        };
        Switch.prototype.getBackground = function () {
            var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
            var deltaY = 0;
            if (this.button.isDown)
                deltaY = -0.30;
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v);
        };
        Switch.prototype.getButtonColor = function () {
            var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
            var deltaY = 0;
            if (this.button.isDown)
                deltaY = -0.30;
            else if (this.button.hasFocus)
                deltaY = 0.10;
            return Ui.Color.createFromYuv(yuv.y + deltaY, yuv.u, yuv.v);
        };
        Switch.prototype.updateColors = function () {
            this.bar.fill = this.getForeground().addA(-0.6);
            this.background.fill = this.getBackground();
            this.buttonContent.fill = this.getForeground();
        };
        Switch.prototype.onDown = function (movable) {
            this.stopAnimation();
            this.updateColors();
        };
        Switch.prototype.onUp = function (movable, speedX, speedY, deltaX, deltaY, cumulMove, abort) {
            if (abort)
                return;
            if (cumulMove < 10)
                this.value = !this._value;
            else {
                if (this.pos > 0.5)
                    speedX = 1;
                else
                    speedX = -1;
                this.startAnimation(speedX);
            }
            this.updateColors();
        };
        Switch.prototype.startAnimation = function (speed) {
            this.stopAnimation();
            this.speed = speed;
            this.animStart = this.pos;
            if (this.speed > 0)
                this.animNext = 1;
            else
                this.animNext = 0;
            if (this.animStart !== this.animNext) {
                this.alignClock = new Anim.Clock({ duration: 'forever', target: this });
                this.connect(this.alignClock, 'timeupdate', this.onAlignTick);
                this.alignClock.begin();
            }
            else {
                if (this._value !== (this.animNext === 1)) {
                    this._value = (this.animNext === 1);
                    this.fireEvent('change', this, this._value);
                }
            }
        };
        Switch.prototype.stopAnimation = function () {
            if (this.alignClock !== undefined) {
                this.alignClock.stop();
                this.alignClock = undefined;
            }
        };
        Switch.prototype.onAlignTick = function (clock, progress, delta) {
            if (delta === 0)
                return;
            var relprogress = (clock.time * this.speed) / (this.animNext - this.animStart);
            if (relprogress >= 1) {
                this.alignClock.stop();
                this.alignClock = undefined;
                relprogress = 1;
                this._value = (this.animNext === 1);
                this.fireEvent('change', this, this._value);
            }
            relprogress = this.ease.ease(relprogress);
            this.pos = (this.animStart + relprogress * (this.animNext - this.animStart));
            this.updatePos();
        };
        Switch.prototype.measureCore = function (width, height) {
            var buttonSize = this.button.measure(0, 0);
            var size = buttonSize;
            var res;
            res = this.background.measure(buttonSize.width * 1.75, 0);
            if (res.width > size.width)
                size.width = res.width;
            if (res.height > size.height)
                size.height = res.height;
            res = this.bar.measure(buttonSize.width * 1.75, 0);
            if (res.width > size.width)
                size.width = res.width;
            if (res.height > size.height)
                size.height = res.height;
            if (buttonSize.width * 1.75 > size.width)
                size.width = buttonSize.width * 1.75;
            return size;
        };
        Switch.prototype.arrangeCore = function (width, height) {
            this.button.arrange(0, (height - this.button.measureHeight) / 2, this.button.measureWidth, this.button.measureHeight);
            this.background.arrange(this.button.layoutWidth / 2, (height - this.background.measureHeight) / 2, width - this.button.layoutWidth, this.background.measureHeight);
            this.updatePos();
        };
        Switch.prototype.onStyleChange = function () {
            var borderWidth = this.getStyleProperty('borderWidth');
            this.updateColors();
        };
        Switch.prototype.onDisable = function () {
            _super.prototype.onDisable.call(this);
            this.button.opacity = 0.2;
        };
        Switch.prototype.onEnable = function () {
            _super.prototype.onEnable.call(this);
            this.button.opacity = 1;
        };
        Switch.style = {
            radius: 0,
            borderWidth: 1,
            background: '#e1e1e1',
            backgroundBorder: '#919191',
            foreground: '#07a0e5'
        };
        return Switch;
    }(Ui.Container));
    Ui.Switch = Switch;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Accordeonable = (function (_super) {
        __extends(Accordeonable, _super);
        function Accordeonable(init) {
            var _this = _super.call(this, init) || this;
            _this.current = -1;
            _this.headersSize = 0;
            _this.contentSize = 0;
            _this._orientation = 'horizontal';
            _this.addEvents('change');
            _this.clipToBounds = true;
            return _this;
        }
        Object.defineProperty(Accordeonable.prototype, "orientation", {
            get: function () {
                return this._orientation;
            },
            set: function (orientation) {
                if (this._orientation != orientation) {
                    this._orientation = orientation;
                    for (var i = 0; i < this.pages.length; i++)
                        this.pages[i].setOrientation(orientation);
                    this.invalidateMeasure();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Accordeonable.prototype, "pages", {
            get: function () {
                return this.children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Accordeonable.prototype, "currentPage", {
            get: function () {
                return this._currentPage;
            },
            set: function (page) {
                for (var i = 0; i < this.pages.length; i++) {
                    if (this.pages[i] == page) {
                        this.currentPosition = i;
                        return;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Accordeonable.prototype, "currentPosition", {
            get: function () {
                return this.current;
            },
            set: function (pos) {
                if (this.pages.length === 0) {
                    if (this._currentPage !== undefined)
                        this._currentPage.unselect();
                    this._currentPage = undefined;
                    this.current = -1;
                }
                else {
                    this.current = pos;
                    var newPage = this.pages[this.current];
                    if (newPage !== this._currentPage) {
                        if (this._currentPage !== undefined)
                            this._currentPage.unselect();
                        this._currentPage = newPage;
                        this.fireEvent('change', this, this._currentPage, this.current);
                        this.disconnect(this._currentPage, 'select', this.onPageSelect);
                        this._currentPage.select();
                        this.connect(this._currentPage, 'select', this.onPageSelect);
                    }
                    if (this.clock !== undefined)
                        this.clock.stop();
                    this.clock = new Anim.Clock({ duration: 2, target: this });
                    this.connect(this.clock, 'timeupdate', this.onClockTick);
                    this.clock.begin();
                }
            },
            enumerable: true,
            configurable: true
        });
        Accordeonable.prototype.appendPage = function (page) {
            this.appendChild(page);
            page.setOffset(1);
            page.setOrientation(this._orientation);
            this.connect(page, 'select', this.onPageSelect);
            this.connect(page, 'close', this.onPageClose);
            page.select();
        };
        Accordeonable.prototype.removePage = function (page) {
            var pos = -1;
            for (var i = 0; i < this.pages.length; i++) {
                if (this.pages[i] == page) {
                    pos = i;
                    break;
                }
            }
            if (pos !== -1) {
                this.disconnect(page, 'select', this.onPageSelect);
                this.disconnect(page, 'close', this.onPageClose);
                this.removeChild(page);
                if ((this.current === pos) && (this.current === 0))
                    this.currentPosition = 0;
                else if (this.current >= pos)
                    this.currentPosition = this.current - 1;
                else
                    this.currentPosition = this.current;
            }
        };
        Accordeonable.prototype.onClockTick = function (clock, progress) {
            for (var i = 0; i < this.pages.length; i++) {
                var child = this.pages[i];
                if (i == this.current)
                    child.showContent();
                var offset = child.getOffset();
                if (offset > 1)
                    child.setOffset(1);
                else {
                    var destOffset = void 0;
                    if (i <= this.current)
                        destOffset = 0;
                    else
                        destOffset = 1;
                    child.setOffset(destOffset - ((destOffset - offset) * (1 - progress)));
                }
                if ((progress == 1) && (i != this.current))
                    child.hideContent();
            }
        };
        Accordeonable.prototype.onPageSelect = function (page) {
            this.currentPage = page;
        };
        Accordeonable.prototype.onPageClose = function (page) {
            this.removePage(page);
        };
        Accordeonable.prototype.measureHorizontal = function (width, height) {
            var i;
            var size;
            var child;
            var content;
            var minHeaders = 0;
            var minContent = 0;
            var minHeight = 0;
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                size = child.measure(width, height);
                minHeaders += child.getHeader().measureWidth;
                if (child.getHeader().measureHeight > minHeight)
                    minHeight = child.getHeader().measureHeight;
            }
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                size = child.measure((width - minHeaders) + child.getHeader().measureWidth, height);
                content = child.getContent();
                if ((content !== undefined) && (content.measureWidth > minContent)) {
                    minContent = content.measureWidth;
                    if (content.measureHeight > minHeight)
                        minHeight = content.measureHeight;
                }
            }
            this.headersSize = minHeaders;
            return { width: minHeaders + minContent, height: minHeight };
        };
        Accordeonable.prototype.measureVertical = function (width, height) {
            var i;
            var child;
            var size;
            var content;
            var minHeaders = 0;
            var minContent = 0;
            var minWidth = 0;
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                size = child.measure(width, height);
                minHeaders += child.getHeader().measureHeight;
                if (child.getHeader().measureWidth > minWidth)
                    minWidth = child.getHeader().measureWidth;
            }
            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                size = child.measure(width, (height - minHeaders) + child.getHeader().measureHeight);
                content = child.getContent();
                if ((content !== undefined) && (content.measureHeight > minContent)) {
                    minContent = content.measureHeight;
                    if (content.measureWidth > minWidth)
                        minWidth = content.measureWidth;
                }
            }
            this.headersSize = minHeaders;
            return { width: minWidth, height: minHeaders + minContent };
        };
        Accordeonable.prototype.measureCore = function (width, height) {
            if (this._orientation == 'horizontal')
                return this.measureHorizontal(width, height);
            else
                return this.measureVertical(width, height);
        };
        Accordeonable.prototype.arrangeCore = function (width, height) {
            var i;
            var child;
            var x;
            var y;
            if (this._orientation == 'horizontal') {
                x = 0;
                this.contentSize = width - this.headersSize;
                for (i = 0; i < this.children.length; i++) {
                    child = this.children[i];
                    child.arrange(x, 0, this.contentSize + child.getHeader().measureWidth, height);
                    x += child.getHeader().measureWidth;
                }
            }
            else {
                y = 0;
                this.contentSize = height - this.headersSize;
                for (i = 0; i < this.children.length; i++) {
                    child = this.children[i];
                    child.arrange(0, y, width, this.contentSize + child.getHeader().measureHeight);
                    y += child.getHeader().measureHeight;
                }
            }
        };
        return Accordeonable;
    }(Ui.Container));
    Ui.Accordeonable = Accordeonable;
    var AccordeonPage = (function (_super) {
        __extends(AccordeonPage, _super);
        function AccordeonPage(init) {
            var _this = _super.call(this, init) || this;
            _this.offset = 0;
            _this.isSelected = false;
            _this.addEvents('select', 'unselect', 'close', 'orientationchange');
            _this.headerBox = new Ui.Pressable();
            _this.appendChild(_this.headerBox);
            _this.connect(_this.headerBox, 'press', _this.onHeaderPress);
            return _this;
        }
        AccordeonPage.prototype.close = function () {
            this.fireEvent('close', this);
        };
        AccordeonPage.prototype.select = function () {
            if (!this.isSelected) {
                this.isSelected = true;
                this.fireEvent('select', this);
            }
        };
        AccordeonPage.prototype.getIsSelected = function () {
            return this.isSelected;
        };
        AccordeonPage.prototype.getHeader = function () {
            return this.header;
        };
        AccordeonPage.prototype.setHeader = function (header) {
            if (header !== this.header) {
                if (this.header !== undefined)
                    this.headerBox.removeChild(this.header);
                this.header = header;
                if (this.header !== undefined)
                    this.headerBox.appendChild(this.header);
            }
        };
        AccordeonPage.prototype.getContent = function () {
            return this.content;
        };
        AccordeonPage.prototype.setContent = function (content) {
            if (this.content !== content) {
                if (this.content !== undefined)
                    this.removeChild(this.content);
                this.content = content;
                if (this.content !== undefined)
                    this.appendChild(this.content);
            }
        };
        AccordeonPage.prototype.getOrientation = function () {
            return this.orientation;
        };
        AccordeonPage.prototype.setOrientation = function (orientation) {
            if (this.orientation != orientation) {
                this.orientation = orientation;
                this.fireEvent('orientationchange', this, orientation);
                this.invalidateMeasure();
            }
        };
        AccordeonPage.prototype.unselect = function () {
            if (this.isSelected) {
                this.isSelected = false;
                this.fireEvent('unselect', this);
            }
        };
        AccordeonPage.prototype.showContent = function () {
            if (this.content !== undefined) {
                this.content.show();
            }
        };
        AccordeonPage.prototype.hideContent = function () {
            if (this.content !== undefined) {
                this.content.hide();
            }
        };
        AccordeonPage.prototype.getOffset = function () {
            return this.offset;
        };
        AccordeonPage.prototype.setOffset = function (offset) {
            this.offset = offset;
            if (this.orientation == 'horizontal')
                this.transform = Ui.Matrix.createTranslate(this.offset * (this.layoutWidth - this.headerBox.measureWidth), 0);
            else
                this.transform = Ui.Matrix.createTranslate(0, this.offset * (this.layoutHeight - this.headerBox.measureHeight));
        };
        AccordeonPage.prototype.onHeaderPress = function () {
            this.select();
        };
        AccordeonPage.prototype.measureCore = function (width, height) {
            var size = this.headerBox.measure(width, height);
            var contentSize = { width: 0, height: 0 };
            if (this.content !== undefined) {
                if (this.orientation == 'horizontal') {
                    contentSize = this.content.measure(width - size.width, height);
                    if (contentSize.height > size.height)
                        size.height = contentSize.height;
                    size.width += contentSize.width;
                }
                else {
                    contentSize = this.content.measure(width, height - size.height);
                    if (contentSize.width > size.width)
                        size.width = contentSize.width;
                    size.height += contentSize.height;
                }
            }
            return size;
        };
        AccordeonPage.prototype.arrangeCore = function (width, height) {
            if (this.orientation == 'horizontal') {
                this.headerBox.arrange(0, 0, this.headerBox.measureWidth, height);
                if (this.content !== undefined)
                    this.content.arrange(this.headerBox.measureWidth, 0, width - this.headerBox.measureWidth, height);
            }
            else {
                this.headerBox.arrange(0, 0, width, this.headerBox.measureHeight);
                if (this.content !== undefined)
                    this.content.arrange(0, this.headerBox.measureHeight, width, height - this.headerBox.measureHeight);
            }
            this.setOffset(this.offset);
        };
        return AccordeonPage;
    }(Ui.Container));
    Ui.AccordeonPage = AccordeonPage;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var Accordeon = (function (_super) {
        __extends(Accordeon, _super);
        function Accordeon() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Accordeon;
    }(Ui.Accordeonable));
    Ui.Accordeon = Accordeon;
})(Ui || (Ui = {}));
var Ui;
(function (Ui) {
    var DropAtBox = (function (_super) {
        __extends(DropAtBox, _super);
        function DropAtBox(init) {
            var _this = _super.call(this, init) || this;
            _this.watchers = [];
            _this.allowedTypes = undefined;
            _this.addEvents('drageffect', 'dragenter', 'dragleave', 'dropat', 'dropfileat');
            _this.fixed = new Ui.Fixed();
            _super.prototype.append.call(_this, _this.fixed);
            _this.connect(_this, 'dragover', _this.onDragOver);
            return _this;
        }
        DropAtBox.prototype.addType = function (type, effects) {
            if (typeof (type) === 'string')
                type = type.toLowerCase();
            if (this.allowedTypes == undefined)
                this.allowedTypes = [];
            if (typeof (effects) === 'string')
                effects = [effects];
            if (typeof (effects) !== 'function') {
                for (var i = 0; i < effects.length; i++) {
                    var effect = effects[i];
                    if (typeof (effect) === 'string')
                        effect = { action: effect };
                    if (!('text' in effect)) {
                        if (effect.action === 'copy')
                            effect.text = 'Copier';
                        else if (effect.action === 'move')
                            effect.text = 'Déplacer';
                        else if (effect.action === 'link')
                            effect.text = 'Lier';
                        else
                            effect.text = effect.action;
                    }
                    if (!('dragicon' in effect))
                        effect.dragicon = 'drag' + effect.action;
                    effects[i] = effect;
                }
                this.allowedTypes.push({ type: type, effect: effects });
            }
            else
                this.allowedTypes.push({ type: type, effect: effects });
        };
        DropAtBox.prototype.setContainer = function (container) {
            this.container = container;
            _super.prototype.append.call(this, this.container);
        };
        DropAtBox.prototype.getContainer = function () {
            return this.container;
        };
        DropAtBox.prototype.setMarkerOrientation = function (orientation) {
            this.markerOrientation = orientation;
        };
        DropAtBox.prototype.setMarkerPos = function (marker, pos) {
            marker.show();
            var spacing = 0;
            if ('spacing' in this.container)
                spacing = this.container.spacing;
            if (pos < this.container.children.length) {
                var child = this.container.children[pos];
                if (this.markerOrientation === 'horizontal') {
                    var x = child.layoutX - child.marginLeft -
                        (marker.layoutWidth + marker.marginLeft + marker.marginRight + spacing) / 2;
                    var y = child.layoutY;
                    var height = child.layoutHeight;
                    marker.height = height;
                    this.fixed.setPosition(marker, x, y);
                }
                else {
                    var x = child.layoutX;
                    var y = child.layoutY - child.marginTop - (marker.layoutHeight + marker.marginTop + marker.marginBottom) / 2 - spacing / 2;
                    marker.width = child.layoutWidth;
                    this.fixed.setPosition(marker, x, y);
                }
            }
            else if (this.container.children.length > 0) {
                var child = this.container.children[this.container.children.length - 1];
                if (this.markerOrientation === 'horizontal') {
                    var x = child.layoutX + child.layoutWidth - (marker.layoutWidth - spacing) / 2;
                    var y = child.layoutY;
                    var height = child.layoutHeight;
                    marker.height = height;
                    this.fixed.setPosition(marker, x, y);
                }
                else {
                    var x = child.layoutX;
                    var y = child.layoutY + child.layoutHeight - marker.layoutHeight / 2;
                    marker.width = child.layoutWidth;
                    this.fixed.setPosition(marker, x, y);
                }
            }
        };
        DropAtBox.prototype.findPosition = function (point) {
            if (this.markerOrientation === 'horizontal')
                return this.findPositionHorizontal(point);
            else
                return this.findPositionVertical(point);
        };
        DropAtBox.prototype.findPositionHorizontal = function (point) {
            var line = [];
            var childs = this.container.children;
            for (var i = 0; i < childs.length; i++) {
                if ((point.y >= childs[i].layoutY) && (point.y < childs[i].layoutY + childs[i].layoutHeight))
                    line.push(childs[i]);
            }
            var element = undefined;
            var dist = Number.MAX_VALUE;
            for (var i = 0; i < line.length; i++) {
                var cx = line[i].layoutX + ((line[i].layoutWidth) / 2);
                var d = Math.abs(point.x - cx);
                if (d < dist) {
                    dist = d;
                    element = line[i];
                }
            }
            if ((element === undefined) && (line.length > 0))
                element = line[line.length - 1];
            var insertPos = childs.length;
            if (element !== undefined) {
                var elPos = -1;
                for (var i = 0; (elPos == -1) && (i < childs.length); i++) {
                    if (childs[i] == element)
                        elPos = i;
                }
                if (point.x < element.layoutX + element.layoutWidth / 2)
                    insertPos = elPos;
                else
                    insertPos = elPos + 1;
            }
            return insertPos;
        };
        DropAtBox.prototype.findPositionVertical = function (point) {
            var childs = this.container.children;
            var element = undefined;
            var dist = Number.MAX_VALUE;
            for (var i = 0; i < childs.length; i++) {
                var cy = childs[i].layoutY + ((childs[i].layoutHeight) / 2);
                var d = Math.abs(point.y - cy);
                if (d < dist) {
                    dist = d;
                    element = childs[i];
                }
            }
            if ((element === undefined) && (childs.length > 0))
                element = childs[childs.length - 1];
            var insertPos = childs.length;
            if (element !== undefined) {
                var elPos = -1;
                for (var i = 0; (elPos === -1) && (i < childs.length); i++) {
                    if (childs[i] === element)
                        elPos = i;
                }
                if (point.y < element.layoutY + element.layoutHeight / 2)
                    insertPos = elPos;
                else
                    insertPos = elPos + 1;
            }
            return insertPos;
        };
        DropAtBox.prototype.insertAt = function (element, pos) {
            if ('insertAt' in this.container)
                this.container.insertAt(element, pos);
        };
        DropAtBox.prototype.moveAt = function (element, pos) {
            if ('moveAt' in this.container)
                this.container.moveAt(element, pos);
        };
        Object.defineProperty(DropAtBox.prototype, "logicalChildren", {
            get: function () {
                return this.container.children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropAtBox.prototype, "content", {
            set: function (content) {
                if ('content' in this.container)
                    this.container.content = content;
            },
            enumerable: true,
            configurable: true
        });
        DropAtBox.prototype.clear = function () {
            this.container.clear();
        };
        DropAtBox.prototype.append = function (item) {
            if ('append' in this.container)
                this.container.append(item);
        };
        DropAtBox.prototype.remove = function (item) {
            if ('remove' in this.container)
                this.container.remove(item);
        };
        DropAtBox.prototype.onStyleChange = function () {
            var color = this.getStyleProperty('markerColor');
            for (var i = 0; i < this.watchers.length; i++) {
                var marker = (this.watchers[i])["Ui.DropAtBox.marker"];
                marker.setFill(color);
            }
        };
        DropAtBox.prototype.getAllowedTypesEffect = function (dataTransfer) {
            if (this.allowedTypes !== undefined) {
                var data = dataTransfer.getData();
                var effect = undefined;
                for (var i = 0; (effect === undefined) && (i < this.allowedTypes.length); i++) {
                    var type = this.allowedTypes[i];
                    if (typeof (type.type) === 'string') {
                        if (type.type === 'all')
                            effect = type.effect;
                        else if (data instanceof Ui.DragNativeData) {
                            if ((type.type === 'files') && data.hasFiles())
                                effect = type.effect;
                            else if (((type.type === 'text') || (type.type === 'text/plain')) && data.hasTypes('text/plain', 'text'))
                                effect = type.effect;
                            else if (data.hasType(type.type))
                                effect = type.effect;
                        }
                    }
                    else if (data instanceof type.type)
                        effect = type.effect;
                }
                if (typeof (effect) === 'function') {
                    var effects = this.onDragEffectFunction(dataTransfer, effect);
                    for (var i = 0; i < effects.length; i++) {
                        var effect_2 = effects[i];
                        if (typeof (effect_2) === 'string')
                            effect_2 = { action: effect_2 };
                        if (!('text' in effect_2)) {
                            if (effect_2.action === 'copy')
                                effect_2.text = 'Copier';
                            else if (effect_2.action === 'move')
                                effect_2.text = 'Déplacer';
                            else if (effect_2.action === 'link')
                                effect_2.text = 'Lier';
                            else if (effect_2.action === 'run')
                                effect_2.text = 'Exécuter';
                            else if (effect_2.action === 'play')
                                effect_2.text = 'Jouer';
                            else
                                effect_2.text = effect_2.action;
                        }
                        if (!('dragicon' in effect_2))
                            effect_2.dragicon = 'drag' + effect_2.action;
                        effects[i] = effect_2;
                    }
                    effect = effects;
                }
                if (effect === undefined)
                    effect = [];
                return effect;
            }
            else
                return [];
        };
        DropAtBox.prototype.onDragEffect = function (dataTransfer) {
            var dragEvent = new Ui.DragEvent();
            dragEvent.setType('drageffect');
            dragEvent.setBubbles(false);
            dragEvent.dataTransfer = dataTransfer;
            dragEvent.dispatchEvent(this);
            var effectAllowed = dragEvent.effectAllowed;
            if (effectAllowed !== undefined)
                return dragEvent.effectAllowed;
            else
                return this.getAllowedTypesEffect(dataTransfer);
        };
        DropAtBox.prototype.onDragOver = function (event) {
            var foundWatcher = undefined;
            for (var i = 0; (foundWatcher === undefined) && (i < this.watchers.length); i++)
                if (this.watchers[i].getDataTransfer() === event.dataTransfer)
                    foundWatcher = this.watchers[i];
            var effect = this.onDragEffect(event.dataTransfer);
            if (foundWatcher !== undefined) {
                var equal = effect.length === foundWatcher.getEffectAllowed();
                for (var i = 0; equal && (i < effect.length); i++) {
                    equal = effect[i] === foundWatcher.getEffectAllowed()[i];
                }
                if (!equal) {
                    foundWatcher.release();
                    foundWatcher = undefined;
                }
            }
            if ((effect !== undefined) && (effect.length > 0) && (foundWatcher === undefined)) {
                var watcher = event.dataTransfer.capture(this, effect);
                this.watchers.push(watcher);
                this.connect(watcher, 'move', this.onWatcherMove);
                this.connect(watcher, 'drop', this.onWatcherDrop);
                this.connect(watcher, 'leave', this.onWatcherLeave);
                event.stopImmediatePropagation();
                this.onWatcherEnter(watcher);
            }
            else if (foundWatcher !== undefined)
                event.stopImmediatePropagation();
        };
        DropAtBox.prototype.onDragEffectFunction = function (dataTransfer, func) {
            var position = this.findPosition(this.pointFromWindow(dataTransfer.getPosition()));
            return func(dataTransfer.getData(), position);
        };
        DropAtBox.prototype.onWatcherEnter = function (watcher) {
            var marker = new Ui.Frame({ margin: 2, frameWidth: 2, width: 6, height: 6 });
            marker.fill = this.getStyleProperty('markerColor');
            marker.hide();
            this.fixed.append(marker, 0, 0);
            watcher["Ui.DropAtBox.marker"] = marker;
        };
        DropAtBox.prototype.onWatcherMove = function (watcher) {
            this.onDragEnter(watcher.getDataTransfer());
            var marker = watcher["Ui.DropAtBox.marker"];
            var position = this.findPosition(this.pointFromWindow(watcher.getPosition()));
            this.setMarkerPos(marker, position);
        };
        DropAtBox.prototype.onWatcherLeave = function (watcher) {
            var found = false;
            var i = 0;
            for (; !found && (i < this.watchers.length); i++) {
                found = (this.watchers[i] === watcher);
            }
            i--;
            if (found)
                this.watchers.splice(i, 1);
            if (this.watchers.length === 0)
                this.onDragLeave();
            var marker = watcher["Ui.DropAtBox.marker"];
            this.fixed.remove(marker);
        };
        DropAtBox.prototype.onWatcherDrop = function (watcher, effect, x, y) {
            var point = this.pointFromWindow(new Ui.Point(x, y));
            this.onDrop(watcher.getDataTransfer(), effect, point.getX(), point.getY());
        };
        DropAtBox.prototype.onDragEnter = function (dataTransfer) {
            this.fireEvent('dragenter', this, dataTransfer.getData());
        };
        DropAtBox.prototype.onDragLeave = function () {
            this.fireEvent('dragleave', this);
        };
        DropAtBox.prototype.onDrop = function (dataTransfer, dropEffect, x, y) {
            var done = false;
            var point = new Ui.Point(x, y);
            var position = this.findPosition(point);
            if (!this.fireEvent('dropat', this, dataTransfer.getData(), dropEffect, position, x, y)) {
                var data = dataTransfer.getData();
                if (data instanceof Ui.DragNativeData && data.hasFiles()) {
                    var files = data.getFiles();
                    var done_1 = true;
                    for (var i = 0; i < files.length; i++)
                        done_1 = done_1 && this.fireEvent('dropfileat', this, files[i], dropEffect, position, x, y);
                }
            }
            else
                done = true;
            return done;
        };
        DropAtBox.style = {
            markerColor: Ui.Color.createFromRgb(0.4, 0, 0.35, 0.8)
        };
        return DropAtBox;
    }(Ui.LBox));
    Ui.DropAtBox = DropAtBox;
    var FlowDropBox = (function (_super) {
        __extends(FlowDropBox, _super);
        function FlowDropBox(init) {
            var _this = _super.call(this, init) || this;
            _this._flow = new Ui.Flow();
            _this.setContainer(_this._flow);
            _this.setMarkerOrientation('horizontal');
            return _this;
        }
        Object.defineProperty(FlowDropBox.prototype, "uniform", {
            set: function (uniform) {
                this._flow.uniform = uniform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowDropBox.prototype, "spacing", {
            set: function (spacing) {
                this._flow.spacing = spacing;
            },
            enumerable: true,
            configurable: true
        });
        return FlowDropBox;
    }(DropAtBox));
    Ui.FlowDropBox = FlowDropBox;
    var SFlowDropBox = (function (_super) {
        __extends(SFlowDropBox, _super);
        function SFlowDropBox(init) {
            var _this = _super.call(this) || this;
            _this._sflow = new Ui.SFlow();
            _this.setContainer(_this._sflow);
            _this.setMarkerOrientation('horizontal');
            if (init)
                _this.assign(init);
            return _this;
        }
        Object.defineProperty(SFlowDropBox.prototype, "stretchMaxRatio", {
            set: function (ratio) {
                this._sflow.stretchMaxRatio = ratio;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlowDropBox.prototype, "uniform", {
            set: function (uniform) {
                this._sflow.uniform = uniform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlowDropBox.prototype, "uniformRatio", {
            set: function (uniformRatio) {
                this._sflow.uniformRatio = uniformRatio;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlowDropBox.prototype, "itemAlign", {
            set: function (align) {
                this._sflow.itemAlign = align;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SFlowDropBox.prototype, "spacing", {
            set: function (spacing) {
                this._sflow.spacing = spacing;
            },
            enumerable: true,
            configurable: true
        });
        return SFlowDropBox;
    }(DropAtBox));
    Ui.SFlowDropBox = SFlowDropBox;
    var VDropBox = (function (_super) {
        __extends(VDropBox, _super);
        function VDropBox(init) {
            var _this = _super.call(this, init) || this;
            _this._vbox = new Ui.VBox();
            _this.setContainer(_this._vbox);
            _this.setMarkerOrientation('vertical');
            return _this;
        }
        Object.defineProperty(VDropBox.prototype, "uniform", {
            set: function (uniform) {
                this._vbox.uniform = uniform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VDropBox.prototype, "spacing", {
            set: function (spacing) {
                this._vbox.spacing = spacing;
            },
            enumerable: true,
            configurable: true
        });
        return VDropBox;
    }(DropAtBox));
    Ui.VDropBox = VDropBox;
    var HDropBox = (function (_super) {
        __extends(HDropBox, _super);
        function HDropBox(init) {
            var _this = _super.call(this, init) || this;
            _this._hbox = new Ui.HBox();
            _this.setContainer(_this._hbox);
            _this.setMarkerOrientation('horizontal');
            return _this;
        }
        Object.defineProperty(HDropBox.prototype, "uniform", {
            set: function (uniform) {
                this._hbox.uniform = uniform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HDropBox.prototype, "spacing", {
            set: function (spacing) {
                this._hbox.spacing = spacing;
            },
            enumerable: true,
            configurable: true
        });
        return HDropBox;
    }(DropAtBox));
    Ui.HDropBox = HDropBox;
})(Ui || (Ui = {}));
//# sourceMappingURL=era.js.map
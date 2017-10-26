import { momentMap, format } from './date.js';

// Vue Store
weMail.store = new Vuex.Store({});

// Global Event Bus
weMail.event = new Vue();

// jQuery ajax wrapper
function Ajax(url, method, headers, data) {
    const test = $.ajax({
        url,
        method,
        dataType: 'json',
        headers,
        data
    });

    return test;
}

// Ajax get method
weMail.ajax.get = (action, options) => {
    return Ajax(weMail.ajaxurl, 'get', {}, $.extend(true, {
        action: `wemail_${action}`,
        _wpnonce: weMail.nonce
    }, options));
};

// Ajax post method
weMail.ajax.post = (action, options) => {
    return Ajax(weMail.ajaxurl, 'post', {}, $.extend(true, {
        action: `wemail_${action}`,
        _wpnonce: weMail.nonce
    }, options));
};

// weMail REST API
const API = {
    root: weMail.api.root,
    site: weMail.api.site,
    user: weMail.api.user,
    _query: {},
    _url: '',

    headers() {
        return {
            Authorization: `Bearer ${this.user}`
        };
    },

    resetProps() {
        this._url = '';
        this._query = {};
    },

    query(query) {
        this._query = $.extend(true, this._query, query);

        return this;
    },

    buildQuery(url, query) {
        if (url) {
            url = `${this.root}${url}`;

        } else if (this._url) {
            url = `${this.root}${this._url}`;
        }

        if (query) {
            this._query = $.extend(true, this._query, query);
        }

        return url;
    },

    get(url, query) {
        url = this.buildQuery(url, query);

        const response = Ajax(url, 'get', this.headers(), $.extend(true, {}, this._query));

        this.resetProps();

        return response;
    },

    post(url, data) {
        url = this.buildQuery(url);

        const response = Ajax(url, 'post', this.headers(), $.extend(true, {}, data));

        this.resetProps();

        return response;
    },

    create(data) {
        return this.post(null, data);
    },

    save(data) {
        return this.post(null, data);
    },

    delete(url) {
        url = this.buildQuery(url);

        const response = Ajax(url, 'delete', this.headers(), $.extend(true, {}, this._query));

        this.resetProps();

        return response;
    }
};

weMail.api = new Proxy(API, {
    get(api, field) {
        if (api.hasOwnProperty(field)) {
            return api[field];
        }

        return function (param) {
            this._url += `/${_.kebabCase(field)}`;

            if (param) {
                this._url += `/${param}`;
            }

            return this;
        };
    }
});

// Register vuex stores
weMail.registerStore = function (routeName, store) {
    if (!this.stores[routeName]) {
        this.stores[routeName] = {};
    }

    this.stores[routeName] = $.extend(true, this.stores[routeName], store);
};

// Register vue mixins
weMail.registerMixins = function (mixins) {
    _.forEach(mixins, (mixin, name) => {
        if (!weMail.mixins[name]) {
            weMail.mixins[name] = mixin;
        }
    });
};

weMail.getMixins = function (...mixins) {
    return mixins.map((mixin) => weMail.mixins[mixin]);
};

// weMail VueRouter api
weMail.childRoutes = {};

weMail.registerChildRoute = function (parent, childRoute) {
    if (!weMail.childRoutes[parent]) {
        weMail.childRoutes[parent] = [];
    }

    weMail.childRoutes[parent].push(childRoute);
};

weMail.getChildRoutes = function (parent) {
    return weMail.childRoutes[parent] || [];
};

// weMail components
weMail.components = {};

weMail.registerComponents = function (components) {
    _.forEach(components, (component, name) => {
        if (!weMail.components[name]) {
            weMail.components[name] = component;
        }
    });
};

// weMail content type components for customizers
weMail.customizerContentComponents = {};

weMail.setCustomizerContentComponents = function (context, components) {
    if (!weMail.customizerContentComponents.hasOwnProperty(context)) {
        weMail.customizerContentComponents[context] = {};
    }

    _.forEach(components, (component, name) => {
        weMail.customizerContentComponents[context][name] = component;
    });
};

// wp date-time format to moment js date-time formatting helper function
weMail.dateTime.toMoment = format;

weMail.dateTime.getMomentFormat = function (dateFormat) {
    const formatMap = momentMap();
    let i;
    let char;
    const newFormat = [];

    for (i = 0; i < dateFormat.length; i++) {
        char = dateFormat[i];

        // Is this an escape?
        if (char === '\\') {
            // Add next character, then move on.
            i++;
            newFormat.push(`[${dateFormat[i]}]`);
            continue;
        }

        if (char in formatMap) {
            if (typeof formatMap[char] !== 'string') {
                newFormat.push(`[${char}]`);
            } else {
                // Otherwise, add as a formatting string.
                newFormat.push(formatMap[char]);
            }
        } else {
            newFormat.push(`[${char}]`);
        }
    }

    return newFormat.join('[]');
};

weMail.momentDateFormat = weMail.dateTime.getMomentFormat(weMail.dateTime.server.dateFormat);
weMail.momentTimeFormat = weMail.dateTime.getMomentFormat(weMail.dateTime.server.timeFormat);

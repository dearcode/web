if (typeof window.DDstorage == 'undefined') {
	window.DDstorage = {};
}

DDstorage = {
	set : function(key, data, forever) {
		if (typeof window.sessionStorage == 'object') {
			try {
				sessionStorage.setItem(key, JSON.stringify(data));
			} catch (e) {
				sessionStorage.clear();
			}
		}

        if(forever) {
            if(typeof window.localStorage == "object") {
                try{
                    localStorage.setItem(key, JSON.stringify(data));
                }catch(e) {

                }
            }
        }
	},
	get : function(key) {
		if (typeof window.sessionStorage == 'object') {
			try{
				var str = sessionStorage.getItem(key);
                if(str == null) {
                    str = localStorage.getItem(key);
                }
	            return JSON.parse(str);
			}catch(e){

			}

		}

		return null;
	},
	remove : function(key) {
		if (typeof window.sessionStorage == 'object') {
			sessionStorage.removeItem(key);
            localStorage.removeItem(key)
		}
	}
};

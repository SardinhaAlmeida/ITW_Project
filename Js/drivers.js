var vm = function() {
    console.log('ViewModel initiated...');
    var self = this;
    self.search = '';
    self.filter = 'null';
    self.baseUri = ko.observable('http://192.168.160.58/Formula1/api/drivers');
    self.displayName = 'Drivers List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(21);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function() {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function() {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function() {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function() {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function() {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    self.activate = function(id) {
        console.log('CALL: getDrivers...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function(data) {
            console.log(data);
            hideLoading();
            self.records(data.List);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.PageCount);
            self.totalRecords(data.Total);
        });
        composedUri2 = self.baseUri();
        ajaxHelper(composedUri2, 'GET').done(function(data) {
            hideLoading();
            var tags = [];
            var tags1 = [];
            for (var x = 0; x < data.Total; x++) {
                var c = data.List[x];
                tags.push(c.Name);
            };

            for (var x = 0; x < tags.length; x++) {
                if (!tags1.includes(tags[x])) {
                    tags1.push(tags[x])
                }
            };
            $("#searchbar").autocomplete({
                minLength: 2,
                source: tags1
            });
        });
    };

    function ajaxHelper(uri, method, data) {
        self.error('');
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }



    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function(e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }

    }

    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);

    else {
        self.activate(pg);
    };

    search = function() {
        console.log("search");
        self.search = $("#searchbar").val();
        var changeuri = 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + self.search;
        self.driverslist = [];
        ajaxHelper(changeuri, 'GET').done(function(data) {
            console.log(data);
            showLoading();
            if (self.filter != 'null') {
                p = self.filter;
                var auto = []
                for (var a = 0; a < data.length; a++) {
                    var v = data[a];
                    if (v.Nationality == p) {
                        auto.push(v);
                    }
                }
                self.records(auto);
                self.totalRecords(auto.length);
                for (var info in auto) {
                    self.driverslist.push(auto[info]);
                }
            } else {
                self.records(data);
                self.totalRecords(data.length);
                for (var info in data) {
                    self.driverslist.push(data[info]);
                }
            }
            $("#pagination").addClass("d-none");
            $("#line").addClass("d-none");
            hideLoading();

        });
    }

    $(".countryFilter").change(function() {

        p = $(this).children("option:selected").val();
        self.filter = p;
        if (p != 'null') {
            showLoading();
            var url = '';
            if (self.search != '') {
                url = 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + self.search;
            } else {
                url = self.baseUri();
            }
            ajaxHelper(url, 'GET').done(function(data) {
                var auto = [];
                if (self.search != '') {
                    for (var a = 0; a < data.length; a++) {
                        var v = data[a];
                        if (v.Nationality == p) {
                            auto.push(v);
                        }
                    }
                } else {
                    for (var a = 0; a < data.List.length; a++) {
                        var v = data.List[a];
                        if (v.Nationality == p) {
                            auto.push(v);
                        }
                    }
                }
                self.records(auto);
                self.totalRecords(auto.length);
                $("#pagination").addClass("d-none");
                $("#line").addClass("d-none");
                $('#mapa').addClass("d-none");
            })


            hideLoading();
        } else {
            showLoading();
            var url = '';
            if (self.search != '') {
                url = 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + self.search;
            } else {
                url = self.baseUri();
            }
            ajaxHelper(url, 'GET').done(function(data) {
                var auto = [];
                if (self.search != '') {
                    for (var a = 0; a < data.length; a++) {
                        var v = data[a];
                        auto.push(v);
                    }
                } else {
                    for (var a = 0; a < data.List.length; a++) {
                        var v = data.List[a];
                        auto.push(v);
                    }
                }
                self.records(auto);
                self.totalRecords(auto.length);
                $("#pagination").addClass("d-none");
                $("#line").addClass("d-none");
                $('#mapa').addClass("d-none")
            })
            hideLoading();
        }
    });

    $(document).keypress(function(key) {
        if (key.which == 13) {
            search();
        }
    });

    self.updateLocalStorage = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data))
    }

    self.favorites = ko.observableArray(JSON.parse(localStorage.getItem("driverFavorites")))

    self.favButton = (id, event) => {
        if (!event.target.classList.contains('active')) {
            if (self.favorites.indexOf(id) === -1)
                self.favorites.push(id)
            self.updateLocalStorage("driverFavorites", self.favorites())
            event.target.classList.remove('fa-heart-o');
            event.target.classList.add('fa-heart');
            event.target.classList.add('active');
            console.log(self.favorites())
        } else {
            self.favorites.splice(self.favorites.indexOf(id), 1)
            self.updateLocalStorage("driverFavorites", self.favorites())
            event.target.classList.remove('fa-heart-o');
            event.target.classList.add('fa-heart-o');
            event.target.classList.remove('active');
            console.log(self.favorites())
        }
    }


    self.checkButton = function(id) {
        return self.favorites().includes(id)
    }
};

$(document).ready(function() {
    ko.applyBindings(new vm());
});
(function () {
    function CalendarFun(el, opts) {
        opts = opts || {};
        $.extend(this, CalendarFun.DEFAULT_OPTS, opts);
        this.calWrap = $(el);
        this.build();
    }

    CalendarFun.DEFAULT_OPTS = {
        month_names: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        short_month_names: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        short_day_names: ["日", "一", "二", "三", "四", "五", "六"],
        start_of_week: 1
    };
    CalendarFun.prototype = {
        build: function () {
            var monthNav = $('<p class="month_nav">' + '<span class="button prev" title="上一月">&#171;</span>' + ' <span class="month_name"></span> ' + '<span class="button next" title="下一月">&#187;</span>' + '</p>');
            this.monthNameSpan = $(".month_name", monthNav);
            $(".prev", monthNav).click(this.bindToObj(function () {
                this.moveMonthBy(-1)
            }));
            $(".next", monthNav).click(this.bindToObj(function () {
                this.moveMonthBy(1)
            }));
            var yearNav = $('<p class="year_nav">' + '<span class="button prev" title="上一年">&#171;</span>' + ' <span class="year_name"></span> ' + '<span class="button next" title="下一年">&#187;</span>' + '</p>');
            this.yearNameSpan = $(".year_name", yearNav);
            $(".prev", yearNav).click(this.bindToObj(function () {
                this.moveMonthBy(-12)
            }));
            $(".next", yearNav).click(this.bindToObj(function () {
                this.moveMonthBy(12)
            }));
            var nav = $('<div class="nav"></div>').append(monthNav, yearNav);
            var tableShell = "<table><thead><tr>";
            $(this.adjustDays(this.short_day_names)).each(function () {
                tableShell += "<th>" + this + "</th>"
            });
            tableShell += "</tr></thead><tbody></tbody></table>";
            this.dateSelector = this.rootLayers = $('<div class="calendar_selector"></div>').append(nav, tableShell).appendTo(this.calWrap);
            if ($.browser.msie && $.browser.version < 7) {
                this.ieframe = $('<iframe class="calendar_selector_ieframe" frameborder="0" src="#"></iframe>').insertBefore(this.dateSelector);
                this.rootLayers = this.rootLayers.add(this.ieframe);
                $(".button", nav).mouseover(function () {
                    $(this).addClass("hover")
                });
                $(".button", nav).mouseout(function () {
                    $(this).removeClass("hover")
                })
            }
            this.tbody = $("tbody", this.dateSelector);
            this.selectDate();
            this.initialize();
        },
        selectMonth: function (date) {
            var newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            if (!this.currentMonth || !(this.currentMonth.getFullYear() == newMonth.getFullYear() && this.currentMonth.getMonth() == newMonth.getMonth())) {
                this.currentMonth = newMonth;
                var rangeStart = this.rangeStart(date),
                    rangeEnd = this.rangeEnd(date);
                var numDays = this.daysBetween(rangeStart, rangeEnd);
                var dayCells = "";
                for (var i = 0; i <= numDays; i++) {
                    var currentDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i, 12, 00);
                    if (this.isFirstDayOfWeek(currentDay)) dayCells += "<tr>";
                    if (currentDay.getMonth() == date.getMonth()) {
                        currentDay = new Date(currentDay.getFullYear() + '-' + (currentDay.getMonth() + 1) + '-' + currentDay.getDate());
                        if (currentDay.getTime() >= this.startTime.getTime() && currentDay.getTime() <= this.endTime.getTime()) {
                            if (currentDay.getTime() > this.curTime.getTime()) {
                                dayCells += '<td class="selectable_day enable_use_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
                            } else if (currentDay.getTime() == this.curTime.getTime()) {
                                dayCells += '<td class="selectable_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>'
                            } else {
                                dayCells += '<td class="selectable_day enable_use_day has_use_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
                            }
                        } else if (currentDay.getTime() > this.endTime.getTime() || currentDay.getTime() < this.startTime.getTime()) {
                            dayCells += '<td class="selectable_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>'
                        }

                    } else {
                        dayCells += '<td class="unselected_month" date="' + this.dateToString(currentDay) + '"></td>'
                    }
                    if (this.isLastDayOfWeek(currentDay)) dayCells += "</tr>"
                }
                this.tbody.empty().append(dayCells);
                this.monthNameSpan.empty().append(this.monthName(date));
                this.yearNameSpan.empty().append(this.currentMonth.getFullYear());
                $("td[date=" + this.dateToString(new Date()) + "]", this.tbody).addClass("today");
                $("td.selectable_day", this.tbody).mouseover(function () {
                    $(this).addClass("hover")
                });
                $("td.selectable_day", this.tbody).mouseout(function () {
                    $(this).removeClass("hover")
                })
            }
            $('.selected', this.tbody).removeClass("selected");
            $('td[date=' + this.selectedDateString + ']', this.tbody).addClass("selected")
        },
        selectDate: function (date) {
            if (!date) date = new Date();
            this.selectedDate = date;
            this.selectedDateString = this.dateToString(this.selectedDate);
            this.selectMonth(this.selectedDate)
        },
        dateToString: function (date) {
            return date.getFullYear() + "-" + this.short_month_names[date.getMonth()] + "-" + date.getDate()
        },
        moveMonthBy: function (amount) {
            var newMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + amount, this.currentMonth.getDate());
            this.selectMonth(newMonth)
        },
        monthName: function (date) {
            return this.month_names[date.getMonth()]
        },
        bindToObj: function (fn) {
            var self = this;
            return function () {
                return fn.apply(self, arguments)
            }
        },
        indexFor: function (array, value) {
            for (var i = 0; i < array.length; i++) {
                if (value == array[i]) return i
            }
        },
        shortDayNum: function (day_name) {
            return this.indexFor(this.short_day_names, day_name)
        },
        daysBetween: function (start, end) {
            start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
            return (end - start) / 86400000
        },
        changeDayTo: function (dayOfWeek, date, direction) {
            var difference = direction * (Math.abs(date.getDay() - dayOfWeek - (direction * 7)) % 7);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference)
        },
        rangeStart: function (date) {
            return this.changeDayTo(this.start_of_week, new Date(date.getFullYear(), date.getMonth()), -1)
        },
        rangeEnd: function (date) {
            return this.changeDayTo((this.start_of_week - 1) % 7, new Date(date.getFullYear(), date.getMonth() + 1, 0), 1)
        },
        isFirstDayOfWeek: function (date) {
            return date.getDay() == this.start_of_week
        },
        isLastDayOfWeek: function (date) {
            return date.getDay() == (this.start_of_week - 1) % 7
        },
        adjustDays: function (days) {
            var newDays = [];
            for (var i = 0; i < days.length; i++) {
                newDays[i] = days[(i + this.start_of_week) % 7]
            }
            return newDays
        }
    };
    $.fn.calendar = function (opts) {
        return this.each(function () {
            new CalendarFun(this, opts)
        })
    };
})();
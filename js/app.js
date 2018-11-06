var StudySpotsApi = 'https://kerkuil.leidenuniv.nl/StudySpots/public/api';
var locationId = '1';

function showStudySpotsLocation() {
    return $.getJSON(StudySpotsApi + '/locations/' + locationId + '/rooms', function (data) {
        // Assign data
        rooms = data.rooms;

        // Sort roomrows by floor
        rooms.sort(function (a, b) {
            return a.floor - b.floor;
        });

        // Render main roomrows
        var $mainRooms = $(".mainRoomRows");
        mainRooms = rooms.filter(function (room) {
            return ["Asian Library", "Café UBé", "S-UB Open Magazijn", "Ingang 5 verdieping 2", "Ingang 2/3 verdieping 2"].indexOf(room.name) == -1;
        });
        mainRooms.forEach(function (room) {
            return renderRoomRow(room, $mainRooms);
        });

        // Render main roomrows
        var $asianStudiesRooms = $(".asianStudiesRoomRows");
        asianStudiesRooms = rooms.filter(function (room) {
            return room.name == "Asian Library";
        });
        asianStudiesRooms.forEach(function (room) {
            return renderRoomRow(room, $asianStudiesRooms, "bg-secondary");
        });

        // Render small roomcards
        var $smallRooms = $(".smallRooms");
        smallRooms = rooms.filter(function (room) {
            return ["S-UB Open Magazijn", "Ingang 5 verdieping 2", "Ingang 2/3 verdieping 2"].indexOf(room.name) > -1;
        });
        smallRooms.forEach(function (room) {
            return renderRoomCard(room, $smallRooms);
        });
    });
}

function renderRoomRow(room, $container, backgroundClass) {
    $container.append(
        '<li class="list-group-item" id="roomRow_' + room.id + '"> \
            <div class="row"> \
              <div class="col-12 col-md-4 roomDetails"> \
                <span class="font-weight-bold">' + (room.floor !== null ? room.floor : '-') + '</span> \
                ' + room.name + ' \
              </div> \
              <div class="col-12 col-md-8 roomScore mt-1"> \
                <div class="progress"> \
                  <div class="' + (backgroundClass ? backgroundClass : "bg-warning") + ' progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:0%;"></div> \
                </div> \
              </div> \
            </div> \
            <div class="text-muted">No description</div> \
          </li>'
    );
}

function renderRoomCard(room, $container) {
    $container.append(
        '<div class="col-4"> \
            <div class="card"> \
              <div class="card-body"> \
                <h5 class="card-title">' + room.name + '</h5> \
                <h6 class="card-subtitle mb-2 text-muted">Floor ' + (room.floor !== null ? room.floor : '-') + '</h6> \
                <p class="card-text">No description</p> \
              </div> \
            </div> \
          </div>'
    );
}

function addRandomPerson() {
    var baseSize = 3;
    var positionLeft = -5 + randomNumber(100);
    var positionTop = 1 + randomNumber(80);
    var size = baseSize + (positionTop * 0.4);
    var colorInt = 128 + Math.round(positionTop * 1.3);
    var isFemale = Math.random() >= 0.5;
    $('<i class="personIcon fa fa-' + (isFemale ? 'fe' : '') + 'male" style="display:none;z-index:' + positionTop + ';color:rgb(' + colorInt + ',' + colorInt + ',' + colorInt + ');font-size:' + size + 'em;position:absolute;left:' + positionLeft + '%;top:' + positionTop + '%"></i>').prependTo(".cafeUbePeople");
}

function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1
}

function removeRandomPerson($container) {
    // Remove an element with the class person from the container
    $persons = $(".cafeUbePeople .personIcon");
    $($persons[Math.floor(Math.random() * $persons.length)]).fadeOut(200, function () {
        $(this).remove();
    });
}

function updateStudySpotsScores() {
    $(".studyspotsrefreshing").show();
    return $.getJSON(StudySpotsApi + '/locations/' + locationId + '/rooms/scores', function (data) {
        // Assign data
        scores = data.scores;

        // Set the progressbars
        for (i = 0; i < scores.length; i++) {
            var scoreObject = scores[i];
            var percentage = Math.floor(scoreObject.score > 100 ? 100 : scoreObject.score);
            $('#roomRow_' + scoreObject.roomId + ' .roomScore .progress-bar').css("width", percentage + '%');
        }

        // Get the Café UBé score
        var cafeUbeScoreObj = scores.filter(function (scoreObject) {
            return scoreObject.roomName == "Café UBé";
        })[0];

        // Set the Café UBé persons
        updateCafeUbPeople(cafeUbeScoreObj);

        // set the Café UBé indicator
        updateCafeUbIndicator(cafeUbeScoreObj);

        // Hide the progress icon
        $(".studyspotsrefreshing").hide();
    });
}

/*
 * Add or remove person icons until the target score is reached
 */
function updateCafeUbPeople(scoreObject) {
    var currentCount = $(".cafeUbePeople .personIcon").length;
    var countToDisplay = Math.round(scoreObject.score / 2);

    if (currentCount < countToDisplay) {
        var iconsToAdd = countToDisplay - currentCount;
        for (i = 0; i < iconsToAdd; i++) {
            addRandomPerson();
        }

        // Cascade show next
        (function shownext(jq) {
            jq.eq(0).fadeIn("fast", function () {
                (jq = jq.slice(1)).length && shownext(jq);
            });
        })($('.cafeUbePeople .personIcon:hidden'));
    }

    if (currentCount > countToDisplay) {
        var iconsToRemove = currentCount - countToDisplay;
        for (i = 0; i < iconsToRemove; i++) {
            removeRandomPerson();
        }
    }
}

/*
 * Update the indicator above the people display
 */
function updateCafeUbIndicator(scoreObject) {
    var $indicator = $(".cafeubindicator");

    $indicator.find(".studyspots-radioselect").removeClass("active btn-success btn-warning btn-danger focus").addClass("btn-secondary");

    if (scoreObject.score <= 20) {
        $indicator.find(".studyspots-radioselect.studyspots-quiet").removeClass("btn-secondary").addClass("btn-success active focus");
    } else if (scoreObject.score <= 60) {
        $indicator.find(".studyspots-radioselect.studyspots-normal").removeClass("btn-secondary").addClass("btn-success active focus");
    } else if (scoreObject.score <= 85) {
        $indicator.find(".studyspots-radioselect.studyspots-busy").removeClass("btn-secondary").addClass("btn-warning active focus");
    } else {
        $indicator.find(".studyspots-radioselect.studyspots-crowded").removeClass("btn-secondary").addClass("btn-danger active focus");
    }
}

function timedUpdate() {
    $.when.apply($, [
        updateStudySpotsScores()
    ]).done(function () {
        // Schedule next update
        window.setTimeout(function () {
            timedUpdate();
        }, 10000);
    });
}

// Render location info
$.when(showStudySpotsLocation()).then(function () {
    // Enable timed update
    timedUpdate();
});
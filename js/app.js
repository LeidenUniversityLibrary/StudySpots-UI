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
            <div class="text-muted"></div> \
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
                <p class="card-text"></p> \
              </div> \
            </div> \
          </div>'
    );
}

/* Available Compouters */

function updateAvailableComputers(){
    $(".availablePCsrefreshing").hide();
    return $.getJSON('UB-availablePCs.php', function(data){
      $(".availablePCs").text(data.available + ' / ' + data.total);
      $(".availablePCsrefreshing").hide();
    });
  }

function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1
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
           
            /* var bars = $('.progress');
           var progress = $(scores[i]);
            $(bars[i]).width(progress + '%');
            if (percentage >= 80) {
                $(bars[i]).find(".progress-bar.progress-bar-striped.progress-bar-animated").removeClass("bg-warning").addClass("bg-danger");
            } else if (percentage >= 50 && percentage < 79) {
                $(bars[i]).find(".progress-bar.progress-bar-striped.progress-bar-animated").removeClass("bg-warning").addClass("bg-warning");
            } else if (percentage >= 30 && percentage < 49) {
                $(bars[i]).find(".progress-bar.progress-bar-striped.progress-bar-animated").removeClass("bg-warning").addClass("bg-success");
            } else if (percentage < 30) {
                $(bars[i]).find(".progress-bar.progress-bar-striped.progress-bar-animated").removeClass("bg-warning").addClass("bg-info");
            } */

               }


        // Get the Café UBé score
        var cafeUbeScoreObj = scores.filter(function (scoreObject) {
            return scoreObject.roomName == "Café UBé";
        })[0];

        // set the Café UBé indicator
        updateCafeUbIndicator(cafeUbeScoreObj);

        // Hide the progress icon
        $(".studyspotsrefreshing").hide();
    });
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
        updateAvailableComputers(),
        updateStudySpotsScores()
    ]).done(function () {
        // Schedule next update
        window.setTimeout(function () {
            timedUpdate();
        }, 60000);
    });
}

// Render location info
$.when(showStudySpotsLocation()).then(function () {
    // Enable timed update
    timedUpdate();
});
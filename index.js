$(document).ready(function(){
  let START_YEAR = 2015;
  let END_YEAR = 2015;
  let teams = [{id:'ARI', sYear: 1998},{id:'ATL', sYear: 1966},{id:'BAL', sYear: 1954},{id:'BOS', sYear: 1908},{id:'CHC', sYear: 1903},{id:'CHW', sYear: 1901},{id:'CIN', sYear: 1890},{id:'CLE', sYear: 1915},{id:'COL', sYear: 1993},{id:'DET', sYear: 1901},{id:'HOU', sYear: 1962},{id:'KCR', sYear: 1969},{id:'LAA', sYear: 2005},{id:'LAD', sYear: 1958},{id:'MIA', sYear: 2012},{id:'MIL', sYear: 1970},{id:'MIN', sYear: 1961},{id:'NYM', sYear: 1962},{id:'NYY', sYear: 1913},{id:'OAK', sYear: 1968},{id:'PHI', sYear: 1890},{id:'PIT', sYear: 1891},{id:'SDP', sYear: 1969},{id:'SFG', sYear: 1958},{id:'SEA', sYear: 1977},{id:'STL', sYear: 1900},{id:'TBR', sYear: 2008},{id:'TEX', sYear: 1972},{id:'TOR', sYear: 1977},{id:'WSN', sYear: 2005}];
  let curYear;
  let curTeam = 0;
  let urlTemplate = 'http://www.baseball-reference.com/teams/{teamId}/{year}.shtml';
  let rowData = [];
  let totalRequests = 0;
  let curRequests = 0;
  let sTime = new Date();

  function updateUrl() {
    if (curTeam < teams.length) {
      let newUrl = urlTemplate.replace('{teamId}', teams[curTeam].id);
      newUrl = newUrl.replace('{year}', curYear);
      document.getElementById('contentFrame').src = newUrl;
    } else {
      $('.meter').addClass('animate');
      buildTable();
    }
  }
  function buildTable() {
    let markup = '';
    rowData.sort(function(a,b){
      let aWins = parseInt(a.wins, 10);
      let bWins = parseInt(b.wins, 10);
      if (aWins < bWins) {
        return -1;
      } else if (aWins > bWins) {
        return 1;
      } else {
        return 0;
      }
    });
    rowData.forEach(function(row) {
      markup += ('<tr><td>' + row.year + '</td><td>' + row.name + '</td><td>' + row.wins + '</td><td>' + row.team + '</td></tr>');
    });
    $('#dataTable').append(markup);
    $('#timeLbl').text('Total Time:');
    $('#time').text(secondsToTime((new Date() - sTime)/1000));
    $('#dataTable').removeClass('hidden');
    $('#timeWrapper').removeClass('hidden');
  }
  function iframeRef(frameRef) {
    let content;
    try {
      content = frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument;
    } catch(e) {
      $('#overlayWrapper').removeClass('hidden');
    }
    return content;
  }
  function setup() {
    START_YEAR = parseInt(getParameterByName('syear'),10) || START_YEAR;
    END_YEAR = parseInt(getParameterByName('eyear'),10) || END_YEAR;
    if (END_YEAR > START_YEAR) {
      END_YEAR = START_YEAR;
    }
    curYear = START_YEAR;
    while (teams[curTeam] && teams[curTeam].sYear > curYear) {
      $('#team-'+(teams[curTeam].id).toLowerCase()).removeClass('disabledTeam');
      curTeam++;
    }
    $('#tableHdr').text('Pitching leaders (based on wins) per team between '+END_YEAR+' and '+START_YEAR+' - sorted lowest to highest');
    teams.forEach(function(team) {
      let diff = START_YEAR - Math.max(END_YEAR, parseInt(team.sYear,10));
      if (diff >= 0) {
        totalRequests += (diff + 1);
      }
    });
    updateUrl();
  }
  $('#contentFrame').load(function() {
    let inside = iframeRef(document.getElementById('contentFrame'));
    if (inside) {
      let curData = processIframe(inside);
      if (curData) {
        rowData.push(curData);
      }
      if (curYear === teams[curTeam].sYear || curYear === END_YEAR) {
        $('#team-'+(teams[curTeam].id).toLowerCase()).removeClass('disabledTeam');
        curYear = START_YEAR;
        curTeam++;
        while (teams[curTeam] && teams[curTeam].sYear > curYear) {
          $('#team-'+(teams[curTeam].id).toLowerCase()).removeClass('disabledTeam');
          curTeam++;
        }
      } else {
        curYear--;
      }

      curRequests++;
      let pct = Math.min(curRequests/totalRequests*100, 100);
      pct = pct.toFixed(2) + '%';
      $('#proBar').css('width', pct);
      $('#pctLbl').text(pct);
      let curTime = (new Date() - sTime)/1000;
      $('#time').text(secondsToTime(((curTime/curRequests)*totalRequests)-curTime));

      updateUrl();
    }
  });
  setup();

  // Aplication specific functions
  function processIframe(body) {
    let pitchingEl = body.getElementById('player_standard_pitching');
    let pitchingLeader = {
      name: '',
      wins: 0
    };
    $(pitchingEl).find('tr').each(function(index, row) {
      let cols = $(row).find('td');
      let name = cols[2] ? $(cols[2]).find('a').text() : '';
      let wins = cols[4] ? parseInt($(cols[4]).text(),10) : 0;
      if (wins > pitchingLeader.wins && name) {
        pitchingLeader = {
          name: name,
          wins: wins,
          team: teams[curTeam].id,
          year: curYear
        };
      }
    });
    return pitchingLeader.name ? pitchingLeader : null;
  }

  // Util functions
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  function secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    let timeString = '';
    if (hours > 0 || timeString.length) {
      timeString += (hours + ((hours === 1) ? ' hour ' : ' hours '));
    }
    if (minutes > 0 || timeString.length) {
      timeString += (minutes + ((minutes === 1) ? ' minute ' : ' minutes '));
    }
    timeString += (seconds + ((seconds === 1) ? ' second ' : ' seconds '));
    return timeString;
  }
});
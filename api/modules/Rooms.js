module.exports = function Rooms(){
  var rooms = {}

  this.countFor = function(room){
    return rooms[room]
  }

  this.addTo = function(room){
    if( rooms[room] === undefined ){
      rooms[room] = 1
    }else{
      rooms[room] += 1
    }
  }

  this.removeFrom = function(room){
    if( rooms[room] !== undefined ){
      rooms[room] -= 1
      if( rooms[room] == 0 ){
        delete rooms[room]
      }
    }
  }
}

var _ = require('underscore');
var constants = require('../constants');

module.exports = {
  validate:validate,
  canAddTo:canAddTo
};

function validate(tag){
  if( !tag ) return false;
  if( tag instanceof Array ){
    return areValidTags(tag);
  }else{
    return isValidTag(tag);
  }
};

function canAddTo(tags,tag){
  if( !validate(tags) || tag !==undefined && !validate(tag) )return false;
  if(tags.length == constants.tagsLimit)return false;
  return !contains(tags,tag);
};

function areValidTags(tags){
  if(!tags || tags.length>constants.tagsLimit)return false;
  if( hasDuplicates(tags) )return false;
  for (var i = tags.length - 1; i >= 0; i--) {
    var tag = tags[i];
    if( !isValidTag(tag) )return false;
  };
  return true;
}

function isValidTag(tag){
  if(!tag)return false;
  tag = tag.trim();
  return tag.length > 0 && tag.length < 20;
}

function hasDuplicates(tags){
  return _.uniq(tags, JSON.stringify).length != tags.length;
}

function contains(tags, tag){
  return tags.indexOf(tag) >= 0;
}
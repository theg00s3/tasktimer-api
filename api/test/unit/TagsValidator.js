var expect = require('chai').expect
var TagsValidator = require('../../modules/TagsValidator')

var fullArray = ['tag1','tag2','tag3','tag4','tag5']
var overfullArray = ['tag1','tag2','tag3','tag4','tag5','tag6']
var hasSlotArray = ['tag1','tag2']

describe('TagsValidator', function () {
  it("should not validate a tag that is longer than 20 characters", function() {
    expect(TagsValidator.validate('this is a text longer thao twenty characters')).to.be.false()
  })

  it("should not validate a tag without content", function() {
    expect(TagsValidator.validate('')).to.be.false()
    expect(TagsValidator.validate(' ')).to.be.false()
    expect(TagsValidator.validate(null)).to.be.false()
  })

  it("should validate a valid tag", function() {
    expect(TagsValidator.validate('valid tag')).to.be.true()
  })

  it("should validate an empty array", function() {
    expect(TagsValidator.validate([])).to.be.true()
  })

  it("should not validate an array of tags with duplicates", function() {
    expect(TagsValidator.validate(['tag1','tag1'])).to.be.false()
    expect(TagsValidator.validate(['tag1','tag2','tag1'])).to.be.false()
  })

  it("should not validate an array with more than 5 elements", function() {
    expect(TagsValidator.validate(overfullArray)).to.be.false()
  })

  it("should validate a full array", function() {
    expect(TagsValidator.validate(fullArray)).to.be.true()
  })

  it("should not be able to add a tag to over full array", function() {
    expect(TagsValidator.canAddTo(overfullArray,'tag6')).to.be.false()
  })

  it("should not be able to add a tag to full array", function() {
    expect(TagsValidator.canAddTo(fullArray,'tag6')).to.be.false()
  })

  it("should not be able to add a duplicate tag", function() {
    expect(TagsValidator.canAddTo(hasSlotArray,'tag1')).to.be.false()
  })

})

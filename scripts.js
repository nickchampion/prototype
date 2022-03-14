db.organisations.find({}).forEach(org => {
  var profiles = db.profiles
    .find({ organisation: org._id, type: { $in: ['CARRIER', 'ORGANISER'] } }, { type: 1 })
    .forEach(pro => {
      db.organisation.update(
        { _id: org._id },
        {
          $set: {
            'flags.is_organiser_org': pro.type === 'ORGANISER' ? true : false,
            'flags.is_carrier_org': pro.type === 'CARRIER' ? true : false,
            'flags.is_internal_org': org.internal
          }
        }
      )
    })
})

db.profiles.find({ type: 'INTERNAL' }).forEach(pro => {
  print('updating:', pro)
  db.users.updateOne({ _id: pro.user }, { $addToSet: { groups: ObjectId('61dd6dc21e65f626687fab1f') } })
})

db.profiles.find({ type: 'INTERNAL' }).forEach(pro => {
  print('updating:', pro)
  db.users.updateOne({ _id: pro.user }, { $unset: { groups: 1 } })
})

db.organisations.find({}).forEach(org => {
  var profiles = db.profiles.find({ organisation: org._id, associated_org: { $exists: false } })
  profiles.forEach(pro => {
    const group = db.groups.findOne({ organisation: org._id, name: pro.type })
    if (group) {
      db.users.updateOne({ _id: pro.user }, { $addToSet: { groups: group._id } })
      print('updating:', pro)
    }
  })
})

db.organisations.find({}).forEach(org => {
  var profiles = db.profiles.find({ organisation: org._id, associated_org: { $exists: false } })
  profiles.forEach(pro => {
    db.users.updateOne({ _id: pro.user }, { $unset: { groups: 1 } })
    print('updating:', pro)
  })
})

db.organisations.find({}).forEach(org => {
  db.groups.insert({
    organisation: org._id,
    name: 'DRIVER',
    services: {
      default: 3,
      logistics: 3,
      inventory: 0,
      logistics_quick_quotes: 0,
      trading: 0,
      finance: 0,
      finance_instant_invoice: 0,
      billing: 0,
      admin: 0,
      developer: 0
    },
    created_at: new Date(),
    updated_at: new Date(),
    flags: { system: true, deleted: false }
  })
})

db.organisations.find({}).forEach(org => {
  db.groups.insert({
    organisation: org._id,
    name: 'CARRIER',
    services: {
      default: 15,
      logistics: 15,
      inventory: 15,
      logistics_quick_quotes: 0,
      trading: 0,
      finance: 0,
      finance_instant_invoice: 0,
      billing: 0,
      admin: 0,
      developer: 0
    },
    created_at: new Date(),
    updated_at: new Date(),
    flags: { system: true, deleted: false }
  })
})

db.organisations.find({}).forEach(org => {
  db.groups.insert({
    organisation: org._id,
    name: 'ORGANISER',
    services: {
      default: 15,
      logistics: 15,
      inventory: 15,
      logistics_quick_quotes: 0,
      trading: 0,
      finance: 0,
      finance_instant_invoice: 0,
      billing: 0,
      admin: 0,
      developer: 0
    },
    created_at: new Date(),
    updated_at: new Date(),
    flags: { system: true, deleted: false }
  })
})

db.organisations.find({}).forEach(org => {
  var profiles = db.profiles.find({ organisation: org._id, associated_org: { $exists: false } })
  profiles.forEach(pro => {
    const group = db.groups.findOne({ organisation: org._id, name: pro.type })
    if (group) {
      db.users.updateOne({ _id: pro.user }, { $addToSet: { groups: group._id } })
      print('updating:', pro)
    }
  })
})

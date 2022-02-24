import { GeoRegisteredOwnerChanged, GeoLocation, logger, BaseEvent } from '@hectare/core'

/// when a profile is created of type customer check to see if there is a profile application for the same information if so call GEO to update

export const changeLocationOwner = async (event: BaseEvent): Promise<void> => {
  const e = event as GeoRegisteredOwnerChanged
  try {
    logger.debug('changing locations registered owner :>> ')
    const locations = await GeoLocation.find({
      registered_property_owner: { $in: e.detail.profile_application_ids }
    })

    if (!locations) return
    logger.debug(`location found :>> ${locations}`)

    locations.forEach(async location => {
      location.registered_property_owner = e.detail.profile_id
      location.registered_property_owner_type = 'profile'
      await location.save()
    })

    logger.debug('application processed')
    return
  } catch (e) {
    logger.error(`e => ${e}`)
  }
}

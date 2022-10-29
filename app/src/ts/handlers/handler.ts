/**
 * Rationale: a handler takes the intent of a controller and applies to it the
 * external forces to which it will be subject in the world
 *
 * Question: why not do this in the world? Well, because certain kinds of entities
 * will behave differently when subject to forces - the primary example is cameras,
 * which are not subject to gravity or friction and don't collide the same way as others
 */
export abstract class Handler {

}

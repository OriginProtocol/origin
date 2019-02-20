import contracts from '../../contracts'

export default {
  linkCode: () => contracts.linker.linkCode,
  linked: () => contracts.linker.session.linked
}

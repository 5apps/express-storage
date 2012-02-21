exports.webfinger = (function() {

  function genHostMeta(baseUrl) {
    return '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n'
      +'<XRD xmlns=\'http://docs.oasis-open.org/ns/xri/xrd-1.0\'\n'
      +'     xmlns:hm=\'http://host-meta.net/xrd/1.0\'>\n'
      +'     <hm:Host></hm:Host>\n'
      +'  <Link rel=\'lrdd\'\n'
      +'        template=\''+baseUrl+'/webfinger/{uri}\'>\n'
      +'    <Title>Resource Descriptor</Title>\n'
      +'  </Link>\n'
      +'</XRD>\n';
  }

  function genWebfinger(api, authUrl, template) {
    return '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n'
      +'<XRD xmlns=\'http://docs.oasis-open.org/ns/xri/xrd-1.0\'\n'
      +'     xmlns:hm=\'http://host-meta.net/xrd/1.0\'>\n'
      +'     <hm:Host></hm:Host>\n'
      +'  <Link rel=\'remoteStorage\'\n'
      +'        api=\''+api+'\'\n'
      +'        auth=\''+authUrl+'\'\n'
      +'        template=\''+template+'\'>\n'
      +'    <Title>Resource Descriptor</Title>\n'
      +'  </Link>\n'
      +'</XRD>\n';
  }

  return {
    genHostMeta: genHostMeta,
    genWebfinger: genWebfinger
  };

})();

import translateShape from '../../src/translateShape';

const widgetGizmoCountShape = {
  type: 'structure',
  required: ['widgetType'],
  members: {
    widgetType: {
      type: 'string',
      enum: ['WidgetA', 'WidgetB']
    },
    widgetAGizmoCount: {
      type: 'integer'
    },
    widgetBGizmoCount: {
      type: 'integer'
    }
  }
};

const widgetShapes = {
  WidgetGizmoCount: {
    type: 'structure',
    required: ['widgetType'],
    members: {
      plainProperty: {
        type: 'integer'
      },
      widgetType: {
        shape: 'WidgetType'
      },
      widgetAGizmoCount: {
        shape: 'GizmoCount'
      },
      widgetBGizmoCount: {
        shape: 'GizmoCount'
      }
    }
  },
  WidgetType: {
    type: 'string',
    enum: ['WidgetA', 'WidgetB']
  },
  GizmoCount: {
    type: 'integer'
  }
};

const ambiguousPayloadShape = {
  type: 'structure',
  required: ['widgetType'],
  members: {
    widgetType: {
      type: 'string',
      enum: ['WidgetA', 'WidgetB']
    },
    widgetAGizmoCount: {
      type: 'integer'
    },
    widgetADoodadCount: {
      type: 'integer'
    },
    widgetBGizmoCount: {
      type: 'integer'
    }
  }
};

const ambiguousDiscriminantShape = {
  type: 'structure',
  required: ['widgetType', 'doodadType'],
  members: {
    widgetType: {
      type: 'string',
      enum: ['WidgetA', 'WidgetB']
    },
    doodadType: {
      type: 'string',
      enum: ['WidgetA', 'WidgetB']
    },
    widgetAGizmoCount: {
      type: 'integer'
    },
    widgetBGizmoCount: {
      type: 'integer'
    }
  }
};

const requiredPayloadShape = {
  type: 'structure',
  required: ['widgetType', 'widgetBGizmoCount'],
  members: {
    widgetType: {
      type: 'string',
      enum: ['WidgetA', 'WidgetB']
    },
    widgetAGizmoCount: {
      type: 'integer'
    },
    widgetBGizmoCount: {
      type: 'integer'
    }
  }
};

describe('discriminated union', () => {
  it('should be inferred when correct and inlined', () => {
    translateShape(widgetGizmoCountShape, {}, 'dummyScope')
      .should.have.property('type', 'IntersectionTypeAnnotation');
  });
  it('should be inferred when correct and not inlined', () => {
    translateShape(widgetShapes.WidgetGizmoCount, widgetShapes, 'dummyScope')
      .should.have.property('type', 'IntersectionTypeAnnotation');
  });
  it('common part should have only common properties', () => {
    const commonPart = translateShape(widgetShapes.WidgetGizmoCount, widgetShapes, 'dummyScope')
      .types[0];
    commonPart.should.have.property('type', 'ObjectTypeAnnotation');
    commonPart.should.have.property('properties')
      .which.is.an('array')
      .with.length(1);
  });
  it('discriminated parts should have only discriminated properties', () => {
    const discriminatedParts = translateShape(widgetShapes.WidgetGizmoCount, widgetShapes, 'dummyScope')
      .types[1].types;
    discriminatedParts.should.be.an('array')
      .with.length(2);
    discriminatedParts[0].should.have.property('type', 'ObjectTypeAnnotation');
    discriminatedParts[0].should.have.property('properties')
      .which.is.an('array')
      .with.length(2);
    discriminatedParts[1].should.have.property('type', 'ObjectTypeAnnotation');
    discriminatedParts[1].should.have.property('properties')
      .which.is.an('array')
      .with.length(2);
    discriminatedParts[0].properties[0].should.have.deep.property('key.name', 'widgetType');
    discriminatedParts[0].properties[0].should.have.deep.property('value.type', 'StringLiteralTypeAnnotation');
    discriminatedParts[0].properties[0].should.have.deep.property('value.value', 'WidgetA');
    discriminatedParts[0].properties[1].should.have.deep.property('key.name', 'widgetAGizmoCount');
    discriminatedParts[1].properties[0].should.have.deep.property('key.name', 'widgetType');
    discriminatedParts[1].properties[0].should.have.deep.property('value.type', 'StringLiteralTypeAnnotation');
    discriminatedParts[1].properties[0].should.have.deep.property('value.value', 'WidgetB');
    discriminatedParts[1].properties[1].should.have.deep.property('key.name', 'widgetBGizmoCount');
  });
  it('should not be inferred if there is ambiguity in payload keys', () => {
    translateShape(ambiguousPayloadShape, {}, 'dummyScope').should.have.property('type', 'ObjectTypeAnnotation');
  });
  it('should not be inferred if there are two eligible discriminants', () => {
    translateShape(ambiguousDiscriminantShape, {}, 'dummyScope').should.have.property('type', 'ObjectTypeAnnotation');
  });
  it('should not be inferred if a "discriminated" property is also required', () => {
    translateShape(requiredPayloadShape, {}, 'dummyScope').should.have.property('type', 'ObjectTypeAnnotation');
  });
});

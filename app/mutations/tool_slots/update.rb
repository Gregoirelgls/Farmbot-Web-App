module ToolSlots
  class Update < ToolSlots::Base

#     required do
#       model :device, class: Device
#       model :point,  class: Point
#     end

#     optional do
#       integer :tool_id, nils: true, empty_is_nil: true
#       float   :x
#       float   :y
#       float   :z
#       float   :radius
#       string  :name
#       string  :openfarm_slug
#     end

#     def validate
#       throw "BRB" if tool_id && !device.tools.pluck(:id).includes?(tool_id)
#     end

#     def execute
#       point.point.update_attributes!(update_params) && point
#     end

# private

#     def update_params
#       point.assign_attributes(inputs.slice(:tool_id, :openfarm_slug))
#       inputs
#         .slice(*Point::SHARED_FIELDS)
#         .merge(pointer: point)
#     end
  end
end

jest.mock("../thunks", () => ({
  saveGrid: jest.fn(() => "SAVE_GRID_MOCK"),
  stashGrid: jest.fn(() => "STASH_GRID_MOCK")
}));

jest.mock("../../../../api/crud", () => ({
  init: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { PlantGrid } from "../plant_grid";
import { saveGrid, stashGrid } from "../thunks";
import { error, success } from "../../../../toast/toast";
import { PlantGridProps } from "../interfaces";
import { init } from "../../../../api/crud";
import { Actions } from "../../../../constants";

describe("PlantGrid", () => {
  function fakeProps(): PlantGridProps {
    return {
      xy_swap: true,
      openfarm_slug: "beets",
      itemName: "Beets",
      dispatch: jest.fn(() => Promise.resolve({})),
      botPosition: { x: undefined, y: undefined, z: undefined },
      spread: undefined,
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const el = mount<PlantGrid>(<PlantGrid {...p} />);
    // Upon load, there should be one button.
    const previewButton = el.find("a.preview-button");
    expect(previewButton.text()).toContain("Preview");
    previewButton.simulate("click");
    expect(init).toHaveBeenCalledTimes(6);

    // After clicking PREVIEW, there should be two buttons.
    const cancel = el.find("a.cancel-button");
    const save = el.find("a.save-button");
    expect(cancel.text()).toContain("Cancel");
    expect(save.text()).toContain("Save");
    expect(el.state().status).toEqual("dirty");
  });

  it("saves a grid", async () => {
    const p = fakeProps();
    p.close = jest.fn();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />).instance();
    const oldId = wrapper.state.gridId;
    await wrapper.saveGrid();
    expect(saveGrid).toHaveBeenCalledWith(oldId);
    expect(success).toHaveBeenCalledWith("6 plants added.");
    expect(wrapper.state.gridId).not.toEqual(oldId);
    expect(p.close).toHaveBeenCalled();
  });

  it("saves a point grid", async () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    await wrapper.instance().saveGrid();
    expect(success).toHaveBeenCalledWith("6 points added.");
  });

  it("stashes a grid", async () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    await wrapper.instance().revertPreview({ setStatus: true })();
    expect(stashGrid).toHaveBeenCalledWith(wrapper.state().gridId);
  });

  it("prevents creation of grids with > 100 plants", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    wrapper.setState({
      grid: {
        ...wrapper.state().grid,
        numPlantsH: 10,
        numPlantsV: 11
      }
    });
    wrapper.instance().performPreview();
    expect(error).toHaveBeenCalledWith(
      "Please make a grid with less than 100 plants");
  });

  it("prevents creation of grids with > 100 points", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({
      grid: {
        ...wrapper.state().grid,
        numPlantsH: 10,
        numPlantsV: 11
      }
    });
    wrapper.instance().performPreview();
    expect(error).toHaveBeenCalledWith(
      "Please make a grid with less than 100 points");
  });

  it("discards unsaved changes", async () => {
    window.confirm = jest.fn(() => false);
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({ status: "dirty" });
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith("STASH_GRID_MOCK");
  });

  it("keeps unsaved changes", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({ status: "dirty" });
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith("SAVE_GRID_MOCK");
  });

  it("handles data changes", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    wrapper.instance().onChange("numPlantsH", 6);
    expect(wrapper.state().grid.numPlantsH).toEqual(6);
  });

  it("uses current position", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    expect(wrapper.state().grid.startX).toEqual(100);
    expect(wrapper.state().grid.startY).toEqual(100);
    wrapper.instance().onUseCurrentPosition({ x: 1, y: 2 });
    expect(wrapper.state().grid.startX).toEqual(1);
    expect(wrapper.state().grid.startY).toEqual(2);
  });

  it("toggles packing method", () => {
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    expect(wrapper.state().offsetPacking).toBeFalsy();
    wrapper.find(".grid-planting-toggle").first().find("button")
      .simulate("click");
    expect(wrapper.state().offsetPacking).toBeTruthy();
    expect(init).toHaveBeenCalledTimes(6);
  });

  it("toggles camera view on", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    expect(wrapper.state().cameraView).toBeFalsy();
    wrapper.find(".grid-planting-toggle").last().find("button")
      .simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: wrapper.state().gridId,
    });
    expect(wrapper.state().cameraView).toBeTruthy();
    expect(init).toHaveBeenCalledTimes(6);
  });

  it("toggles camera view off", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({ cameraView: true });
    wrapper.find(".grid-planting-toggle").last().find("button")
      .simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: undefined,
    });
    expect(wrapper.state().cameraView).toBeFalsy();
    expect(init).toHaveBeenCalledTimes(6);
  });
});

import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips, DeviceSetting, Content } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { EncodersOrStallDetectionProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { hasEncoders } from "../firmware_hardware_support";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import { Feature } from "../../interfaces";
import { t } from "../../../i18next_wrapper";

// tslint:disable-next-line:cyclomatic-complexity
export function EncodersOrStallDetection(props: EncodersOrStallDetectionProps) {

  const { encoders_or_stall_detection } = props.controlPanelState;
  const { dispatch, sourceFwConfig, firmwareHardware, arduinoBusy } = props;

  const encodersDisabled = {
    x: !sourceFwConfig("encoder_enabled_x").value,
    y: !sourceFwConfig("encoder_enabled_y").value,
    z: !sourceFwConfig("encoder_enabled_z").value
  };
  const showEncoders = hasEncoders(firmwareHardware);

  return <Highlight className={"section"}
    settingName={DeviceSetting.encoders}>
    <Header
      expanded={encoders_or_stall_detection}
      title={!showEncoders
        ? DeviceSetting.stallDetection
        : DeviceSetting.encoders}
      panel={"encoders_or_stall_detection"}
      dispatch={dispatch} />
    <Collapse isOpen={!!encoders_or_stall_detection}>
      {!showEncoders &&
        <Highlight settingName={DeviceSetting.stallDetectionNote}>
          <div className="stall-detection-note">
            <p>{!props.shouldDisplay(Feature.express_stall_detection)
              ? t(Content.STALL_DETECTION_NOT_AVAILABLE)
              : t(Content.STALL_DETECTION_IN_BETA)}</p>
          </div>
        </Highlight>}
      <SpacePanelHeader />
      <BooleanMCUInputGroup
        label={encoderSettingName(showEncoders)}
        tooltip={!showEncoders
          ? ToolTips.ENABLE_STALL_DETECTION
          : ToolTips.ENABLE_ENCODERS}
        x={"encoder_enabled_x"}
        y={"encoder_enabled_y"}
        z={"encoder_enabled_z"}
        disabled={arduinoBusy || !showEncoders
          && !props.shouldDisplay(Feature.express_stall_detection)}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      {!showEncoders && props.shouldDisplay(Feature.express_stall_sensitivity) &&
        <NumericMCUInputGroup
          label={DeviceSetting.stallSensitivity}
          tooltip={ToolTips.STALL_SENSITIVITY}
          x={"movement_stall_sensitivity_x"}
          y={"movement_stall_sensitivity_y"}
          z={"movement_stall_sensitivity_z"}
          min={-63}
          max={63}
          disabledBy={settingRequiredLabel([DeviceSetting.enableStallDetection])}
          gray={encodersDisabled}
          disabled={arduinoBusy}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {showEncoders &&
        <BooleanMCUInputGroup
          label={DeviceSetting.useEncodersForPositioning}
          tooltip={ToolTips.USE_ENCODERS_FOR_POSITIONING}
          x={"encoder_use_for_pos_x"}
          y={"encoder_use_for_pos_y"}
          z={"encoder_use_for_pos_z"}
          disabledBy={settingRequiredLabel([DeviceSetting.enableEncoders])}
          grayscale={encodersDisabled}
          disabled={arduinoBusy}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {showEncoders &&
        <BooleanMCUInputGroup
          label={DeviceSetting.invertEncoders}
          tooltip={ToolTips.INVERT_ENCODERS}
          x={"encoder_invert_x"}
          y={"encoder_invert_y"}
          z={"encoder_invert_z"}
          disabledBy={settingRequiredLabel([DeviceSetting.enableEncoders])}
          grayscale={encodersDisabled}
          disabled={arduinoBusy}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      <NumericMCUInputGroup
        label={!showEncoders
          ? DeviceSetting.maxMotorLoad
          : DeviceSetting.maxMissedSteps}
        tooltip={!showEncoders
          ? ToolTips.MAX_MISSED_STEPS_STALL_DETECTION
          : ToolTips.MAX_MISSED_STEPS_ENCODERS}
        x={"encoder_missed_steps_max_x"}
        y={"encoder_missed_steps_max_y"}
        z={"encoder_missed_steps_max_z"}
        disabledBy={settingRequiredLabel([encoderSettingName(showEncoders)])}
        gray={encodersDisabled}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        label={!showEncoders
          ? DeviceSetting.gracePeriod
          : DeviceSetting.missedStepDecay}
        tooltip={!showEncoders
          ? ToolTips.MISSED_STEP_DECAY_STALL_DETECTION
          : ToolTips.MISSED_STEP_DECAY_ENCODERS}
        x={"encoder_missed_steps_decay_x"}
        y={"encoder_missed_steps_decay_y"}
        z={"encoder_missed_steps_decay_z"}
        disabledBy={settingRequiredLabel([encoderSettingName(showEncoders)])}
        gray={encodersDisabled}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      {showEncoders &&
        <NumericMCUInputGroup
          label={DeviceSetting.encoderScaling}
          tooltip={ToolTips.ENCODER_SCALING}
          x={"encoder_scaling_x"}
          y={"encoder_scaling_y"}
          z={"encoder_scaling_z"}
          xScale={sourceFwConfig("movement_microsteps_x").value}
          yScale={sourceFwConfig("movement_microsteps_y").value}
          zScale={sourceFwConfig("movement_microsteps_z").value}
          intSize={"long"}
          disabledBy={settingRequiredLabel([DeviceSetting.enableEncoders])}
          gray={encodersDisabled}
          disabled={arduinoBusy}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />}
    </Collapse>
  </Highlight>;
}

/** Generate a setting requirement warning string for a setting based on
 * the provided prerequisites. */
export const settingRequiredLabel = (settingNames: DeviceSetting[]) => {
  const settingList = settingNames
    .map(settingName => t(settingName).toLocaleUpperCase())
    .join(settingNames.length > 1 ? ` ${t("or")} ` : "");
  return `${t("Requires")}: ${settingList}`;
};

const encoderSettingName = (showEncoders: boolean) => !showEncoders
  ? DeviceSetting.enableStallDetection
  : DeviceSetting.enableEncoders;

/** Generate a setting requirement warning string for settings that require
 * either encoders/stall detection or limit switches. */
export const encodersOrLimitSwitchesRequired = (showEncoders: boolean) => {
  const encoders = !showEncoders
    ? DeviceSetting.enableStallDetection
    : DeviceSetting.enableEncoders;
  const limitSwitches = DeviceSetting.enableLimitSwitches;
  return settingRequiredLabel([encoders, limitSwitches]);
};

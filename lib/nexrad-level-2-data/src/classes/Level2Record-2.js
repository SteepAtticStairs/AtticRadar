// parse message type 2
module.exports = (raf, message) => {
	message.record = {
		rdaStatus: raf.readShort(),
		operabilityStatus: raf.readShort(),
		controlStatus: raf.readShort(),
		auxiliaryPowerGeneratorState: raf.readShort(),
		averageTransmitterPower: raf.readShort(),
		horizontalReflectivityCalibrationCorrection: raf.readSignedInt() / 100,
		dataTransmissionEnabled: raf.readShort(),
		volumeCoveragePatternNumber: raf.readSignedInt(),
		rdaControlAuthorization: raf.readShort(),
		rdaBuildNumber: buildNumber(raf.readSignedInt()),
		operationalMode: raf.readShort(),
		superResolutionStatus: raf.readShort(),
		clutterMitigationDecisionStatus: raf.readShort(),
		avsetStatus: raf.readShort(),
		rdaAlarmSummary: raf.readShort(),
		commandAcknowledgement: raf.readShort(),
		channelControlStatus: raf.readShort(),
		spotBlankingStatus: raf.readShort(),
		bypassMapGenerationDate: raf.readInt(),
		bypassMapGenerationTime: raf.readInt(),
		clutterFilterMapGenerationDate: raf.readInt(),
		clutterFilterMapGenerationTime: raf.readInt(),
		verticalReflectivyCalibrationCorrection: raf.readSignedInt() / 100,
		transmitterPowerSourceStatus: raf.readShort(),
		rmsControlStatus: raf.readShort(),
		performanceCheckStatus: raf.readShort(),
		alarmCodes: alarmCodes(raf),
		signalProcessingOptions: raf.readShort(),
		spares: raf.read(36),
		statusVersion: raf.readInt(),
	};

	return message;
};

const buildNumber = (raw) => {
	if (raw / 100 > 2) return raw / 100;
	return raw / 10;
};

const alarmCodes = (raf) => {
	const alarms = [];
	for (let i = 0; i < 14; i += 1) {
		alarms.push(raf.readShort());
	}
	return alarms;
};

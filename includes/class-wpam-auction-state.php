<?php
namespace WPAM\Includes;

class WPAM_Auction_State {
	const SCHEDULED      = 'scheduled';
	const ABOUT_TO_START = 'about_to_start';
	const LIVE           = 'live';
	const ENDED          = 'ended';
	const COMPLETED      = 'completed';
	const FAILED         = 'failed';
	const CANCELED       = 'canceled';
	const SUSPENDED      = 'suspended';

	public static function all() {
		return array(
			self::SCHEDULED,
			self::ABOUT_TO_START,
			self::LIVE,
			self::ENDED,
			self::COMPLETED,
			self::FAILED,
			self::CANCELED,
			self::SUSPENDED,
		);
	}
}

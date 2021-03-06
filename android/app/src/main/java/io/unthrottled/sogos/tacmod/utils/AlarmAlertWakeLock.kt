package io.unthrottled.sogos.tacmod.utils

import android.content.Context
import android.os.PowerManager
import android.os.PowerManager.WakeLock
import android.util.Log
import io.unthrottled.sogos.tacmod.ACTIVITY_NAME

object AlarmAlertWakeLock {
  private const val TAG = "TacMod:AlarmAlertWakeLock"

  private var sCpuWakeLock: WakeLock? = null

  fun createPartialWakeLock(context: Context): WakeLock {
    val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, TAG)
  }

  fun acquireCpuWakeLock(context: Context) {
    if (sCpuWakeLock != null) {
      return
    }
    sCpuWakeLock = createPartialWakeLock(context)
    sCpuWakeLock!!.acquire()
  }

  fun releaseCpuLock() {
    if (sCpuWakeLock != null) {
      Log.i(ACTIVITY_NAME, "Releasing wakelock")
      sCpuWakeLock!!.release()
      sCpuWakeLock = null
    }
  }
}
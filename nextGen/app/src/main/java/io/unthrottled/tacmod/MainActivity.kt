package io.unthrottled.tacmod

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Bundle
import com.google.android.material.snackbar.Snackbar
import androidx.appcompat.app.AppCompatActivity
import android.view.Menu
import android.view.MenuItem
import io.unthrottled.tacmod.alarm.AlarmParameters
import io.unthrottled.tacmod.alarm.AlarmService
import io.unthrottled.tacmod.alarm.AlarmService.NOTIFICATION_CHANNEL_ID
import io.unthrottled.tacmod.alarm.NotificationMessage
import io.unthrottled.tacmod.alarm.VibrationPattern

import kotlinx.android.synthetic.main.activity_main.*
import java.time.Instant
import java.util.*

class MainActivity : AppCompatActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    initializeAlarm()
    setContentView(R.layout.activity_main)
    setSupportActionBar(toolbar)

    fab.setOnClickListener { view ->
      val alarmParameters = AlarmParameters(
        NotificationMessage(
          "Yeet!",
          "It works!"
        ),
        Instant.now().toEpochMilli() + (20 * 60 * 1000),
        VibrationPattern.LONG
      )
      AlarmService.scheduleAlarm(
        applicationContext,
        alarmParameters
      )
      Snackbar.make(view, "Alarm Set for ${Instant.ofEpochMilli(alarmParameters.timeToAlert)}", Snackbar.LENGTH_LONG)
          .setAction("Action", null).show()
    }
  }

  private fun initializeAlarm() {
    val notificationChannel = NotificationChannel(
      NOTIFICATION_CHANNEL_ID,
      "TacMod",
      NotificationManager.IMPORTANCE_DEFAULT
    )

    notificationChannel.enableVibration(true)
    notificationChannel.vibrationPattern = longArrayOf(100L,200L,300L,100L,200L,300L, 100L,200L,300L);

    this.getSystemService(NotificationManager::class.java)
      ?.createNotificationChannel(notificationChannel)
  }

  override fun onCreateOptionsMenu(menu: Menu): Boolean {
    // Inflate the menu; this adds items to the action bar if it is present.
    menuInflater.inflate(R.menu.menu_main, menu)
    return true
  }

  override fun onOptionsItemSelected(item: MenuItem): Boolean {
    // Handle action bar item clicks here. The action bar will
    // automatically handle clicks on the Home/Up button, so long
    // as you specify a parent activity in AndroidManifest.xml.
    return when (item.itemId) {
      R.id.action_settings -> true
      else -> super.onOptionsItemSelected(item)
    }
  }
}

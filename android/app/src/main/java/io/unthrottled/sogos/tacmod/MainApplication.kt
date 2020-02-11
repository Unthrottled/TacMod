package io.unthrottled.sogos.tacmod

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import io.unthrottled.sogos.tacmod.stream.StreamPackage
import java.lang.reflect.InvocationTargetException


@Suppress("UNUSED")
class MainApplication : Application(), ReactApplication {
  private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean {
      return BuildConfig.DEBUG
    }

    override fun getPackages(): List<ReactPackage> {
      val packages: MutableList<ReactPackage> = PackageList(this).packages
      packages.add(StreamPackage())
      return packages
    }

    override fun getJSMainModuleName(): String {
      return "index"
    }
  }

  override fun getReactNativeHost(): ReactNativeHost {
    return mReactNativeHost
  }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this,  /* native exopackage */false)
    initializeFlipper(this) // Remove this line if you don't want Flipper enabled

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      initializeAlarm()
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  fun initializeAlarm() {
    val notificationChannel = NotificationChannel(
        "TacModNotifications",
        "TacMod",
        NotificationManager.IMPORTANCE_DEFAULT
    )
    notificationChannel.enableVibration(true)
    notificationChannel.vibrationPattern = longArrayOf(100L,200L,300L);

    this.getSystemService(NotificationManager::class.java)
        ?.createNotificationChannel(notificationChannel)
  }

  companion object {
    /**
     * Loads Flipper in React Native templates.
     *
     * @param context
     */
    private fun initializeFlipper(context: Context) {
      if (BuildConfig.DEBUG) {
        try { /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
          val aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper")
          aClass.getMethod("initializeFlipper", Context::class.java).invoke(null, context)
        } catch (e: ClassNotFoundException) {
          e.printStackTrace()
        } catch (e: NoSuchMethodException) {
          e.printStackTrace()
        } catch (e: IllegalAccessException) {
          e.printStackTrace()
        } catch (e: InvocationTargetException) {
          e.printStackTrace()
        }
      }
    }
  }
}
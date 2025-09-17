package com.alexliu07.classtimetable

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import java.time.LocalTime

@Entity
data class Data(
    @PrimaryKey(autoGenerate = true) val id: Int? = null,
    @ColumnInfo val day: Int,
    @ColumnInfo val subject: String,
    @ColumnInfo val startTime: LocalTime,
    @ColumnInfo val endTime: LocalTime
)

class Converters{
    @TypeConverter
    fun fromLocalTime(time: LocalTime): String{
        return time.toString()
    }

    @TypeConverter
    fun toLocalTime(time: String): LocalTime{
        return LocalTime.parse(time)
    }
}

@Dao
interface DataDao{
    @Insert
    fun insert(data: Data)

    @Query("SELECT * FROM data WHERE day = :day")
    fun getData(day: Int): List<Data>

    @Query("SELECT * FROM data")
    fun getAll(): List<Data>

    @Query("DELETE FROM data")
    fun empty()

    @Query("DELETE FROM sqlite_sequence")
    fun resetPrimaryKey()

    @Query("SELECT (SELECT COUNT(*) FROM data) == 0")
    fun isEmpty(): Boolean
}

@Database(entities = [Data::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase(){
    abstract fun dataDao(): DataDao
}

fun emptyDB(db: DataDao){
    db.empty()
    db.resetPrimaryKey()
}